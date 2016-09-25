import { Schema, SchemaTag, uint8 } from './schemas';
import { validateData } from './validator';
import {
  BufferLike, createMask, createVariable, getBuffer,
  getBufferSetterName, sizeof, strideof, systemLittleEndian
} from './utils';

/** Serialize a JavaScript object or value into a buffer */
export interface Encoder<T extends Schema> {
  (data: any): Buffer;
  <BufferType extends BufferLike>(data: any, buffer: BufferType, byteOffset?: number): BufferType;
}

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

  return function encode(data, buffer = alloc(sizeof(schema)), byteOffset = 0) {
    if (validate) {
      const message = validateData(schema, data);
      if (message !== undefined) {
        throw new TypeError(JSON.stringify(message));
      }
    }

    const properBuffer = getBuffer(buffer);
    if (sizeof(properBuffer) < sizeof(schema)) {
      throw new RangeError('The provided buffer is too small to store the encoded type');
    }

    encodeUnchecked(data, properBuffer, byteOffset);

    return buffer;
  };
}

export type UncheckedEncoder<T extends Schema> = (data: any, buffer: Buffer, byteOffset?: number) => Buffer;

export function createUncheckedEncoder<T extends Schema>(schema: T): UncheckedEncoder<T> {
  const byteOffsetVar = createVariable('byteOffset');
  const dataVar = createVariable('data');

  return new Function(`
    return function encodeUnchecked(${dataVar}, buffer, ${byteOffsetVar}) {
      "use strict";
      ${createEncoderCode(schema)}
      return buffer;
    }
  `)();
}

export function createEncoderCode(schema: Schema, stackDepth = 0): string {
  const dataVar = createVariable('data', stackDepth);
  const byteOffsetVar = createVariable('byteOffset', stackDepth);
  const innerDataVar = createVariable('data', stackDepth + 1);
  const innerByteOffsetVar = createVariable('byteOffset', stackDepth + 1);

  switch (schema.tag) {
    case SchemaTag.Number: {
      const { numberTag, littleEndian = systemLittleEndian } = schema;
      const bufferSetterName = getBufferSetterName(numberTag, littleEndian);

      return `
        buffer.${bufferSetterName}(${dataVar}, ${byteOffsetVar}, true);
      `;
    }

    case SchemaTag.Bool: {
      return `
        ${dataVar} = Number(${dataVar});
        ${createEncoderCode(uint8, stackDepth)}
      `;
    }

    case SchemaTag.String: {
      const { byteLength, encoding } = schema;

      return `
        buffer.write(${dataVar}, ${byteOffsetVar}, ${byteLength}, ${JSON.stringify(encoding)});
        if (${dataVar}.length < ${byteLength}) {
          buffer[${byteOffsetVar} + ${dataVar}.length] = 0;
        }
      `;
    }

    case SchemaTag.Array: {
      const { byteAlignment, length, elementSchema } = schema;
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
    }

    case SchemaTag.Tuple: {
      const { fields } = schema;

      return `
        ${fields.map(({ schema: fieldSchema, byteOffset }, i) => `
          var ${innerDataVar} = ${dataVar}[${i}];
          var ${innerByteOffsetVar} = ${byteOffsetVar} + ${byteOffset};
          ${createEncoderCode(fieldSchema, stackDepth + 1)}
        `).join('\n')}
      `;
    }

    case SchemaTag.Struct: {
      const { fields } = schema;

      return `
        ${fields.map(({ name, schema: fieldSchema, byteOffset }) => `
          var ${innerDataVar} = ${dataVar}[${JSON.stringify(name)}];
          var ${innerByteOffsetVar} = ${byteOffsetVar} + ${byteOffset};
          ${createEncoderCode(fieldSchema, stackDepth + 1)}
        `).join('\n')}
      `;
    }

    case SchemaTag.Bitfield: {
      const { fields, elementSchema } = schema;

      return `
        var ${innerByteOffsetVar} = ${byteOffsetVar};
        var ${innerDataVar} = 0;
        ${fields.slice().reverse().map(({ name, bits }) => `
          ${innerDataVar} <<= ${bits};
          ${innerDataVar} |= ${dataVar}[${JSON.stringify(name)}] & ${createMask(bits)};
        `).join('\n')}
        ${createEncoderCode(elementSchema, stackDepth + 1)}
      `;
    }

    case SchemaTag.Buffer: {
      const { byteLength } = schema;

      return `
        if (${dataVar}.buffer !== buffer.buffer ||
            ${dataVar}.byteOffset !== ${byteOffsetVar} ||
            ${dataVar}.byteLength !== ${byteLength}) {
          ${dataVar}.copy(buffer, ${byteOffsetVar}, 0, Math.min(${dataVar}.byteLength, ${byteLength}));
        }
      `;
    }

    default:
      throw new TypeError(`Invalid schema tag: ${(schema as Schema).tag}`);
  }
}
