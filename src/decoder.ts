import { Schema, SchemaTag, uint8, RuntimeType, SchemaMap } from './schemas';
import {
  BufferLike,
  createMask,
  createVariable,
  getBuffer,
  getBufferGetterName,
  entries,
  strideof,
  systemLittleEndian,
  keys
} from './utils';

/** Convert a buffer into its JavaScript representation */
export type Decoder<T extends Schema> = (buffer: BufferLike, result?: Partial<RuntimeType<T>>, byteOffset?: number) => RuntimeType<T>;

export interface DecoderOptions {
  /** Validate buffer before decoding */
  validate?: boolean;
}

/** Create a decode function for converting a buffer into its JavaScript representation */
export function createDecoder<T extends Schema>(schema: T, { validate = true }: DecoderOptions = {}): Decoder<T> {
  if (schema === undefined) {
    throw new TypeError('You must specify a type to convert with');
  }
  const decodeUnchecked = createUncheckedDecoder(schema);

  return function decode(buffer, result, byteOffset) {
    const realBuffer = getBuffer(buffer);
    if (validate) {
      if (realBuffer.byteLength < schema.byteLength) {
        throw new RangeError('The buffer is too small!');
      }
    }

    return decodeUnchecked(realBuffer, result, byteOffset);
  };
}

export type UncheckedDecoder<T extends Schema> = (buffer: Buffer, result?: Partial<RuntimeType<T>>, byteOffset?: number) => RuntimeType<T>;

export function createUncheckedDecoder<T extends Schema>(schema: T): UncheckedDecoder<T> {
  const byteOffsetVar = createVariable('byteOffset');
  const resultVar = createVariable('result');

  return new Function(`
    return function decodeUnchecked(buffer, ${resultVar}, ${byteOffsetVar}) {
      "use strict";
      if (${byteOffsetVar} === undefined) {
        ${byteOffsetVar} = 0;
      }
      ${createDecoderCode(schema, 0)}
      return ${resultVar};
    }
  `)();
  }

function createDecoderCode(schema: Schema, stackDepth: number): string {
  const visitor = (decoderVisitors as any)[schema.tag];
  if (visitor === undefined) {
    throw new TypeError(`Invalid schema tag: ${schema.tag}`);
  }
  return visitor(schema, stackDepth);
}

const decoderVisitors: { [Tag in SchemaTag]: (schema: SchemaMap[Tag], stackDepth: number) => string; } = {
  Number({ numberTag, littleEndian = systemLittleEndian }, stackDepth) {
    const resultVar = createVariable('result', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    const bufferGetterName = getBufferGetterName(numberTag, littleEndian);

    return `
      ${resultVar} = buffer.${bufferGetterName}(${byteOffsetVar}, true);
    `;
  },

  Bool({}, stackDepth) {
    const resultVar = createVariable('result', stackDepth);

    return `
      ${createDecoderCode(uint8, stackDepth)}
      ${resultVar} = Boolean(${resultVar});
    `;
  },

  String({ byteLength, encoding }, stackDepth) {
    const resultVar = createVariable('result', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    const indexVar = createVariable('i', stackDepth);
    const maxVar = createVariable('max', stackDepth);

    return `
      var ${indexVar} = ${byteOffsetVar};
      var ${maxVar} = ${byteOffsetVar} + ${byteLength};
      while (${indexVar} < ${maxVar} && buffer[${indexVar}]) {
        ${indexVar}++;
      }
      ${resultVar} = buffer.toString(${JSON.stringify(encoding)}, ${byteOffsetVar}, ${indexVar});
    `;
  },

  Array({ length, byteAlignment, elementSchema }, stackDepth) {
    const resultVar = createVariable('result', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    const innerResultVar = createVariable('result', stackDepth + 1);
    const innerByteOffsetVar = createVariable('byteOffset', stackDepth + 1);
    const indexVar = createVariable('i', stackDepth);
    const maxVar = createVariable('max', stackDepth);
    const stride = strideof(elementSchema, byteAlignment);

    return `
      if (${resultVar} === undefined) {
        ${resultVar} = new Array(${length});
      }
      var ${innerByteOffsetVar} = ${byteOffsetVar};
      for (var ${indexVar} = 0; ${indexVar} < ${length}; ++${indexVar}) {
        var ${innerResultVar} = ${resultVar}[${indexVar}];
        ${createDecoderCode(elementSchema, stackDepth + 1)}
        ${resultVar}[${indexVar}] = ${innerResultVar};
        ${innerByteOffsetVar} += ${stride};
      }
    `;
  },

  Tuple({ fields }, stackDepth) {
    const resultVar = createVariable('result', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    const innerResultVar = createVariable('result', stackDepth + 1);
    const innerByteOffsetVar = createVariable('byteOffset', stackDepth + 1);

    return `
      if (${resultVar} === undefined) {
        ${resultVar} = new Array(${fields.length});
      }
      ${fields.map(({ schema: fieldSchema, byteOffset }, i) => `
        var ${innerResultVar} = ${resultVar}[${i}];
        var ${innerByteOffsetVar} = ${byteOffsetVar} + ${byteOffset};
        ${createDecoderCode(fieldSchema, stackDepth + 1)}
        ${resultVar}[${i}] = ${innerResultVar};
      `).join('\n')}
    `;
  },

  Struct({ fields }, stackDepth) {
    const resultVar = createVariable('result', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    const innerResultVar = createVariable('result', stackDepth + 1);
    const innerByteOffsetVar = createVariable('byteOffset', stackDepth + 1);
    const emptyStruct = `{ ${keys(fields).map(name => `${JSON.stringify(name)}: undefined`).join(', ')} }`;

    return `
      if (${resultVar} === undefined) {
        ${resultVar} = ${emptyStruct};
      }
      ${entries(fields).map(([name, { schema: fieldSchema, byteOffset }]) => `
        var ${innerResultVar} = ${resultVar}[${JSON.stringify(name)}];
        var ${innerByteOffsetVar} = ${byteOffsetVar} + ${byteOffset};
        ${createDecoderCode(fieldSchema, stackDepth + 1)}
        ${resultVar}[${JSON.stringify(name)}] = ${innerResultVar};
      `).join('\n')}
    `;
  },

  Bitfield({ elementSchema, fields }, stackDepth) {
    const resultVar = createVariable('result', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    const innerResultVar = createVariable('result', stackDepth + 1);
    const innerByteOffsetVar = createVariable('byteOffset', stackDepth + 1);
    const emptyBitfield = `{ ${keys(fields).map(name => `${JSON.stringify(name)}: undefined`).join(', ')} }`;

    return `
      if (${resultVar} === undefined) {
        ${resultVar} = ${emptyBitfield};
      }
      var ${innerByteOffsetVar} = ${byteOffsetVar};
      var ${innerResultVar};
      ${createDecoderCode(elementSchema, stackDepth + 1)}
      ${entries(fields).map(([name, bits]) => `
        ${resultVar}[${JSON.stringify(name)}] = ${innerResultVar} & ${createMask(bits)};
        ${innerResultVar} >>>= ${bits};
      `).join('\n')}
    `;
  },

  Buffer({ byteLength } , stackDepth) {
    const resultVar = createVariable('result', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);

    return `
      if (${resultVar} === undefined ||
          ${resultVar}.buffer !== buffer.buffer ||
          ${resultVar}.byteOffset !== ${byteOffsetVar} ||
          ${resultVar}.byteLength !== ${byteLength}) {
        ${resultVar} = buffer.slice(${byteOffsetVar}, ${byteOffsetVar} + ${byteLength});
      }
    `;
  }
};
