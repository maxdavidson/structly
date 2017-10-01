import { createEncoder } from '../encoder';
import { createDecoder } from '../decoder';
import { systemLittleEndian, getBuffer } from '../utils';
import {
  NumberTag,
  NumberSchema,
  array,
  int8,
  uint8,
  int16,
  uint16,
  int32,
  uint32,
  float32,
  float64,
  StringSchema,
} from '../schemas';

const swap16 =
  typeof Buffer.prototype.swap16 === 'function'
    ? (buffer: Buffer) => buffer.swap16()
    : (buffer: Buffer) => {
        const { length } = buffer;
        for (let offset = 0; offset < length; offset += 2) {
          buffer.writeUInt16BE(buffer.readUInt16LE(offset, true), offset, true);
        }
        return buffer;
      };

const swap32 =
  typeof Buffer.prototype.swap32 === 'function'
    ? (buffer: Buffer) => buffer.swap32()
    : (buffer: Buffer) => {
        const { length } = buffer;
        for (let offset = 0; offset < length; offset += 4) {
          buffer.writeUInt32BE(buffer.readUInt32LE(offset, true), offset, true);
        }
        return buffer;
      };

const swap64 =
  typeof Buffer.prototype.swap64 === 'function'
    ? (buffer: Buffer) => buffer.swap64()
    : (buffer: Buffer) => {
        const { length } = buffer;
        for (let offset = 0; offset < length; offset += 8) {
          const lo = buffer.readUInt32LE(offset, true);
          const hi = buffer.readUInt32LE(offset + 4, true);
          buffer.writeUInt32BE(hi, offset, true);
          buffer.writeUInt32BE(lo, offset + 4, true);
        }
        return buffer;
      };

const numberConstructors = {
  Int8: Int8Array,
  UInt8: Uint8Array,
  Int16: Int16Array,
  UInt16: Uint16Array,
  Int32: Int32Array,
  UInt32: Uint32Array,
  Float32: Float32Array,
  Float64: Float64Array,
};

export function encodeHelper<Tag extends NumberTag>(
  schema: NumberSchema<Tag>,
  values: number[],
  littleEndian = systemLittleEndian,
) {
  return () => {
    const arraySchema = array(schema, values.length);
    const encode = createEncoder(arraySchema);
    const encoded = encode(values);

    const valueBuffer = Buffer.from(encoded);
    const constructor = numberConstructors[schema.numberTag];
    const expected = new constructor(values);
    const expectedBuffer = getBuffer(expected);

    if (littleEndian !== systemLittleEndian) {
      switch (schema.byteAlignment) {
        case 2:
          swap16(expectedBuffer);
          break;
        case 4:
          swap32(expectedBuffer);
          break;
        case 8:
          swap64(expectedBuffer);
          break;
        default:
          break;
      }
    }

    expect(valueBuffer.equals(expectedBuffer)).toBe(true);
  };
}

export function decodeHelper<Tag extends NumberTag>(
  schema: NumberSchema<Tag>,
  testValues: number[],
  expectedValues: number[],
  littleEndian = systemLittleEndian,
) {
  return () => {
    const constructor = numberConstructors[schema.numberTag];
    const buffer = getBuffer(new constructor(testValues));

    const length = buffer.byteLength / schema.byteLength;
    const arraySchema = array(schema, length);
    const decode = createDecoder(arraySchema);

    if (littleEndian !== systemLittleEndian) {
      switch (schema.byteAlignment) {
        case 2:
          swap16(buffer);
          break;
        case 4:
          swap32(buffer);
          break;
        case 8:
          swap64(buffer);
          break;
        default:
          break;
      }
    }

    const decoded = decode(buffer) as number[];

    expect(decoded).toEqual(expectedValues);
  };
}

export type ArrayBufferViewConstructor =
  | Int8ArrayConstructor
  | Uint8ArrayConstructor
  | Int16ArrayConstructor
  | Uint16ArrayConstructor
  | Int32ArrayConstructor
  | Uint32ArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor;

export const numberSchemaData: {
  schema: NumberSchema<NumberTag>;
  constructor: ArrayBufferViewConstructor;
}[] = [
  { schema: int8, constructor: Int8Array },
  { schema: uint8, constructor: Uint8Array },
  { schema: int16, constructor: Int16Array },
  { schema: uint16, constructor: Uint16Array },
  { schema: int32, constructor: Int32Array },
  { schema: uint32, constructor: Uint32Array },
  { schema: float32, constructor: Float32Array },
  { schema: float64, constructor: Float64Array },
];

export function createByteString<T extends StringSchema<any, any>>({ byteLength, encoding }: T, str: string) {
  const buffer = Buffer.alloc(byteLength);
  Buffer.from(str, encoding).copy(buffer, 0, 0, byteLength);
  return buffer;
}
