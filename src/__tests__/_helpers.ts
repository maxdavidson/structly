import { ContextualTestContext } from 'ava';
import { createEncoder } from '../encoder';
import { createDecoder } from '../decoder';
import { systemLittleEndian, getBuffer } from '../utils';
import {
  SchemaTag, NumberTag, NumberSchema,
  array, int8, uint8, int16, uint16, int32, uint32, float32, float64
} from '../schemas';

export function numberSchemaHelper<T extends NumberSchema<Tag>, Tag extends NumberTag>(
  schema: T, numberTag: Tag, size: number, littleEndian?: boolean
) {
  return (t: ContextualTestContext) => {
    t.deepEqual<any>(schema, { tag: SchemaTag.Number, numberTag, byteLength: size, byteAlignment: size, littleEndian });
  };
}

const swap16 = typeof Buffer.prototype.swap16 === 'function'
  ? (buffer: Buffer) => buffer.swap16()
  : (buffer: Buffer) => {
    for (let offset = 0, len = buffer.length; offset < len; offset += 2) {
      buffer.writeUInt16BE(buffer.readUInt16LE(offset, true), offset, true);
    }
    return buffer;
  };

const swap32 = typeof Buffer.prototype.swap32 === 'function'
  ? (buffer: Buffer) => buffer.swap32()
  : (buffer: Buffer) => {
    for (let offset = 0, len = buffer.length; offset < len; offset += 4) {
      buffer.writeUInt32BE(buffer.readUInt32LE(offset, true), offset, true);
    }
    return buffer;
  };

const swap64 = typeof Buffer.prototype.swap64 === 'function'
  ? (buffer: Buffer) => buffer.swap64()
  : (buffer: Buffer) => {
    for (let offset = 0, len = buffer.length; offset < len; offset += 8) {
      const lo = buffer.readUInt32LE(offset, true);
      const hi = buffer.readUInt32LE(offset + 4, true);
      buffer.writeUInt32BE(hi, offset, true);
      buffer.writeUInt32BE(lo, offset + 4, true);
    }
    return buffer;
  };

const numberConstructors = {
  [NumberTag.Int8]: Int8Array,
  [NumberTag.UInt8]: Uint8Array,
  [NumberTag.Int16]: Int16Array,
  [NumberTag.UInt16]: Uint16Array,
  [NumberTag.Int32]: Int32Array,
  [NumberTag.UInt32]: Uint32Array,
  [NumberTag.Float32]: Float32Array,
  [NumberTag.Float64]: Float64Array
};

export function encodeHelper<Tag extends NumberTag>(
  schema: NumberSchema<Tag>,
  values: number[],
  littleEndian = systemLittleEndian
) {
  return t => {
    const arraySchema = array(schema, values.length);
    const encode = createEncoder(arraySchema);
    const encoded = encode(values);

    const valueBuffer = Buffer.from(encoded);
    const constructor = numberConstructors[schema.numberTag as number];
    const expected = new constructor(values);
    const expectedBuffer = getBuffer(expected);

    if (littleEndian !== systemLittleEndian) {
      switch (schema.byteAlignment) {
        case 2: swap16(expectedBuffer); break;
        case 4: swap32(expectedBuffer); break;
        case 8: swap64(expectedBuffer); break;
        default: break;
      }
    }

    t.true(valueBuffer.equals(expectedBuffer));
  };
}

export function decodeHelper<Tag extends NumberTag>(
  schema: NumberSchema<Tag>,
  testValues: number[],
  expectedValues: number[],
  littleEndian = systemLittleEndian
) {
  return t => {
    const constructor = numberConstructors[schema.numberTag as number];
    const buffer = getBuffer(new constructor(testValues));

    const length = buffer.byteLength / schema.byteLength;
    const arraySchema = array(schema, length);
    const decode = createDecoder(arraySchema);

    if (littleEndian !== systemLittleEndian) {
      switch (schema.byteAlignment) {
        case 2: swap16(buffer); break;
        case 4: swap32(buffer); break;
        case 8: swap64(buffer); break;
        default: break;
      }
    }

    const decoded = decode(buffer) as number[];

    t.deepEqual(decoded, expectedValues);
  };
}

export type ArrayBufferViewConstructor =
  Int8ArrayConstructor
  | Uint8ArrayConstructor
  | Int16ArrayConstructor
  | Uint16ArrayConstructor
  | Int32ArrayConstructor
  | Uint32ArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor;

export const numberSchemaData: { schema: NumberSchema<NumberTag>; constructor: ArrayBufferViewConstructor; }[] = [
  { schema: int8, constructor: Int8Array },
  { schema: uint8, constructor: Uint8Array },
  { schema: int16, constructor: Int16Array },
  { schema: uint16, constructor: Uint16Array },
  { schema: int32, constructor: Int32Array },
  { schema: uint32, constructor: Uint32Array },
  { schema: float32, constructor: Float32Array },
  { schema: float64, constructor: Float64Array }
];

export function getNumberTagName(tag: NumberTag) {
  switch (tag) {
    case NumberTag.Int8: return 'int8';
    case NumberTag.UInt8: return 'uint8';
    case NumberTag.Int16: return 'int8';
    case NumberTag.UInt16: return 'uint16';
    case NumberTag.Int32: return 'int32';
    case NumberTag.UInt32: return 'uint32';
    case NumberTag.Float32: return 'float32';
    case NumberTag.Float64: return 'float64';
    default: throw new TypeError('Invalid number tag');
  }
}