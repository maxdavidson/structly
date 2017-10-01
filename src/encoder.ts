import { Schema, SchemaTag, uint8, RuntimeType, SchemaMap } from './schemas';
import { validateData } from './validator';
import {
  BufferLike, createMask, createVariable, getBuffer,
  getBufferSetterName, entries, sizeof, strideof, systemLittleEndian
} from './utils';

/** Serialize a JavaScript object or value into a buffer */
export type Encoder<T extends Schema> =
  <BufferType extends BufferLike = Buffer>(data: RuntimeType<T>, buffer?: BufferType, byteOffset?: number) => BufferType;

export interface EncoderOptions {
  /** Validate data on encode */
  validate?: boolean;
  /** Do not zero-out newly allocated buffers */
  unsafe?: boolean;
}

/** Create an encode function for serializing a JavaScript object or value into a buffer */
export function createEncoder<T extends Schema>(schema: T, { validate = true, unsafe = false }: EncoderOptions = {}): Encoder<T> {
  if (typeof schema !== 'object') {
    throw new TypeError('You must specify a schema to convert with');
  }

  const encodeUnchecked = createUncheckedEncoder<T>(schema);
  const alloc = unsafe ? Buffer.allocUnsafe : Buffer.alloc;

  return function encode(data, buffer = alloc(sizeof(schema)) as any, byteOffset = 0) {
    if (validate) {
      const message = validateData(schema, data);
      if (message !== undefined) {
        throw new TypeError(JSON.stringify(message));
      }
    }

    const properBuffer = getBuffer(buffer);
    if (properBuffer.byteLength < sizeof(schema)) {
      throw new RangeError('The provided buffer is too small to store the encoded type');
    }

    encodeUnchecked(data, properBuffer, byteOffset);

    return buffer;
  };
}

export type UncheckedEncoder<T extends Schema> = (data: RuntimeType<T>, buffer: Buffer, byteOffset?: number) => Buffer;

export function createUncheckedEncoder<T extends Schema>(schema: T): UncheckedEncoder<T> {
  const byteOffsetVar = createVariable('byteOffset');
  const dataVar = createVariable('data');

  return new Function(`
    return function encodeUnchecked(${dataVar}, buffer, ${byteOffsetVar}) {
      "use strict";
      ${createEncoderCode(schema, 0)}
      return buffer;
    }
  `)();
}

function createEncoderCode(schema: Schema, stackDepth: number): string {
  const visitor = (encoderVisitors as any)[schema.tag];
  if (visitor === undefined) {
    throw new TypeError(`Invalid schema tag: ${schema.tag}`);
  }
  return visitor(schema, stackDepth);
}

const encoderVisitors: { [Tag in SchemaTag]: (schema: SchemaMap[Tag], stackDepth: number) => string; } = {
  Number({ numberTag, littleEndian = systemLittleEndian }, stackDepth) {
    const dataVar = createVariable('data', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    const bufferSetterName = getBufferSetterName(numberTag, littleEndian);

    return `
      buffer.${bufferSetterName}(${dataVar}, ${byteOffsetVar}, true);
    `;
},

  Bool({}, stackDepth) {
    const dataVar = createVariable('data', stackDepth);

    return `
      ${dataVar} = Number(${dataVar});
      ${createEncoderCode(uint8, stackDepth)}
    `;
},

  String({ byteLength, encoding }, stackDepth) {
    const dataVar = createVariable('data', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);

    return `
      buffer.write(${dataVar}, ${byteOffsetVar}, ${byteLength}, ${JSON.stringify(encoding)});
      if (${dataVar}.length < ${byteLength}) {
        buffer[${byteOffsetVar} + ${dataVar}.length] = 0;
      }
    `;
  },

  Array({ byteAlignment, length, elementSchema }, stackDepth) {
    const dataVar = createVariable('data', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    const innerDataVar = createVariable('data', stackDepth + 1);
    const innerByteOffsetVar = createVariable('byteOffset', stackDepth + 1);
    const indexVar = createVariable('i', stackDepth);
    const stride = strideof(elementSchema, byteAlignment);

    return `
      var ${innerByteOffsetVar} = ${byteOffsetVar};
      for (var ${indexVar} = 0; ${indexVar} < ${length}; ++${indexVar}) {
        var ${innerDataVar} = ${dataVar}[${indexVar}];
        ${createEncoderCode(elementSchema, stackDepth + 1)}
        ${innerByteOffsetVar} += ${stride};
      }
    `;
  },

  Tuple({ fields }, stackDepth) {
    const dataVar = createVariable('data', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    const innerDataVar = createVariable('data', stackDepth + 1);
    const innerByteOffsetVar = createVariable('byteOffset', stackDepth + 1);

    return `
      ${fields.map(({ schema: fieldSchema, byteOffset }, i) => `
        var ${innerDataVar} = ${dataVar}[${i}];
        var ${innerByteOffsetVar} = ${byteOffsetVar} + ${byteOffset};
        ${createEncoderCode(fieldSchema, stackDepth + 1)}
      `).join('\n')}
    `;
  },

  Struct({ fields }, stackDepth) {
    const dataVar = createVariable('data', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    const innerDataVar = createVariable('data', stackDepth + 1);
    const innerByteOffsetVar = createVariable('byteOffset', stackDepth + 1);

    return `
      ${entries(fields).map(([name, { schema: fieldSchema, byteOffset }]) => `
        var ${innerDataVar} = ${dataVar}[${JSON.stringify(name)}];
        var ${innerByteOffsetVar} = ${byteOffsetVar} + ${byteOffset};
        ${createEncoderCode(fieldSchema, stackDepth + 1)}
      `).join('\n')}
    `;
  },

  Bitfield({ fields, elementSchema }, stackDepth) {
    const dataVar = createVariable('data', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    const innerDataVar = createVariable('data', stackDepth + 1);
    const innerByteOffsetVar = createVariable('byteOffset', stackDepth + 1);

    return `
      var ${innerByteOffsetVar} = ${byteOffsetVar};
      var ${innerDataVar} = 0;
      ${entries(fields).slice().reverse().map(([name, bits ]) => `
        ${innerDataVar} <<= ${bits};
        ${innerDataVar} |= ${dataVar}[${JSON.stringify(name)}] & ${createMask(bits)};
      `).join('\n')}
      ${createEncoderCode(elementSchema, stackDepth + 1)}
    `;
  },

  Buffer({ byteLength }, stackDepth) {
    const dataVar = createVariable('data', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);

    return `
      if (${dataVar}.buffer !== buffer.buffer ||
          ${dataVar}.byteOffset !== ${byteOffsetVar} ||
          ${dataVar}.byteLength !== ${byteLength}) {
        ${dataVar}.copy(buffer, ${byteOffsetVar}, 0, Math.min(${dataVar}.byteLength, ${byteLength}));
      }
    `;
  }
};
