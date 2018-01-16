import { NumberTag, Schema } from './schemas';

export type Mutable<T extends any, K extends string = keyof T> = { [P in K]: T[P] };
export type PartialMutable<T extends any, K extends string = keyof T> = { [P in K]?: T[P] };

/** Whether the running system is little endian (true = LE, false = BE) */
export const systemLittleEndian = new Uint32Array(new Uint8Array([0x11, 0x22, 0x33, 0x44]).buffer)[0] === 0x44332211;

/** Gets the closest multiple of byteAlignment from byteOffset (base-2 alignment only) */
export function align(byteOffset: number, byteAlignment: number): number {
  return (byteOffset + byteAlignment - 1) & ~(byteAlignment - 1);
}

/** The byte alignment of the given schema */
export function alignof<T extends Schema>(schema: T): T['byteAlignment'] {
  return schema.byteAlignment;
}

/** The byte size of the schema, excluding alignment padding */
export function sizeof<T extends Schema>(schema: T): T['byteLength'] {
  return schema.byteLength;
}

/** The byte size of the schema, including alignment padding */
export function strideof<T extends Schema>(schema: T, byteAlignment = alignof(schema)): number {
  return align(sizeof(schema), byteAlignment);
}

export function createMask(bits: number): number {
  return bits <= 0 ? 0 : 0xffffffff >>> (32 - bits);
}

export function createVariable(name: string, stackDepth = 0): string {
  return `${name}${stackDepth}`;
}

export function mapValues<T, V>(obj: T, mapper: (value: T[keyof T], key: keyof T) => V): Record<keyof T, V> {
  const mappedObj = {} as any;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      mappedObj[key] = mapper(obj[key], key);
    }
  }
  return mappedObj;
}

/* istanbul ignore next */
export const log2 = Math.log2 || ((x: number) => Math.log(x) / Math.log(2));

export const keys: <T>(obj: T) => (keyof T)[] = Object.keys as any;

/* istanbul ignore next */
export const entries: <T>(obj: T) => [keyof T, T[keyof T]][] =
  Object.entries || (obj => keys(obj).map(key => [key, obj[key]]));

export function getBufferGetterName(numberTag: NumberTag, littleEndian: boolean) {
  switch (numberTag) {
    case NumberTag.Int8:
      return 'readInt8';
    case NumberTag.UInt8:
      return 'readUInt8';
    case NumberTag.Int16:
      return littleEndian ? 'readInt16LE' : 'readInt16BE';
    case NumberTag.UInt16:
      return littleEndian ? 'readUInt16LE' : 'readUInt16BE';
    case NumberTag.Int32:
      return littleEndian ? 'readInt32LE' : 'readInt32BE';
    case NumberTag.UInt32:
      return littleEndian ? 'readUInt32LE' : 'readUInt32BE';
    case NumberTag.Float32:
      return littleEndian ? 'readFloatLE' : 'readFloatBE';
    case NumberTag.Float64:
      return littleEndian ? 'readDoubleLE' : 'readDoubleBE';
    default:
      throw new TypeError(`Invalid number tag: ${numberTag}`);
  }
}

export function getBufferSetterName(numberTag: NumberTag, littleEndian: boolean) {
  switch (numberTag) {
    case NumberTag.Int8:
      return 'writeInt8';
    case NumberTag.UInt8:
      return 'writeUInt8';
    case NumberTag.Int16:
      return littleEndian ? 'writeInt16LE' : 'writeInt16BE';
    case NumberTag.UInt16:
      return littleEndian ? 'writeUInt16LE' : 'writeUInt16BE';
    case NumberTag.Int32:
      return littleEndian ? 'writeInt32LE' : 'writeInt32BE';
    case NumberTag.UInt32:
      return littleEndian ? 'writeUInt32LE' : 'writeUInt32BE';
    case NumberTag.Float32:
      return littleEndian ? 'writeFloatLE' : 'writeFloatBE';
    case NumberTag.Float64:
      return littleEndian ? 'writeDoubleLE' : 'writeDoubleBE';
    default:
      throw new TypeError(`Invalid number tag: ${numberTag}`);
  }
}

function isArrayBufferLike(obj: any): obj is ArrayBufferLike {
  return typeof obj === 'object' && obj !== null && typeof obj.byteLength === 'number';
}

function isArrayBufferViewLike(obj: any): obj is ArrayBufferView {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    isArrayBufferLike(obj.buffer) &&
    typeof obj.byteOffset === 'number' &&
    typeof obj.byteLength === 'number'
  );
}

export type BufferLike = ArrayBufferView | ArrayBufferLike;

export function getBuffer(data: BufferLike): Buffer {
  if (Buffer.isBuffer(data)) {
    return data;
  }

  if (isArrayBufferViewLike(data)) {
    const { buffer, byteOffset, byteLength } = data;
    return getBuffer(buffer).slice(byteOffset, byteOffset + byteLength);
  }

  if (isArrayBufferLike(data)) {
    try {
      return Buffer.from(data as any);
    } catch (e) {
      // Hacky fix for weird behavior in Node 4 with Jest 20's 'node' enviroment
      /* istanbul ignore next */
      return Buffer.from(new Uint8Array(data) as any);
    }
  }

  throw new TypeError(`Invalid input data: ${JSON.stringify(data, null, 2)}`);
}
