import { NumberTag } from './schemas';

/** Whether the running system is little endian (true = LE, false = BE) */
export const systemLittleEndian = new Uint32Array(new Uint8Array([0x11, 0x22, 0x33, 0x44]).buffer)[0] === 0x44332211;

/** Gets the closest multiple of byteAlignment from byteOffset (base-2 alignment only) */
export function align(byteOffset: number, byteAlignment: number) {
  return (byteOffset + byteAlignment - 1) & ~(byteAlignment - 1);
}

/** The byte alignment of the given schema */
export function alignof({ byteAlignment = 0 }: { byteAlignment?: number; } = {}) {
  return byteAlignment;
}

/** The byte size of the schema, excluding alignment padding */
export function sizeof({ byteLength = 0 }: { byteLength?: number; } = {}) {
  return byteLength;
}

/** The byte size of the schema, including alignment padding */
export function strideof(schema: { byteLength?: number; byteAlignment?: number; }, byteAlignment = alignof(schema)) {
  return align(sizeof(schema), byteAlignment);
}

export function createMask(bits: number) {
  return (bits <= 0) ? 0 : (0xffffffff >>> (32 - bits));
}

export function createVariable(name: string, stackDepth = 0) {
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

export const entries: <T>(obj: T) => [keyof T, T[keyof T]][]
  = (Object as any).entries || (obj => Object.keys(obj).map(key => [key, obj[key]] as any));

export function getBufferGetterName(numberTag: NumberTag, littleEndian: boolean) {
  switch (numberTag) {
    case NumberTag.Int8: return 'readInt8';
    case NumberTag.UInt8: return 'readUInt8';
    case NumberTag.Int16: return littleEndian ? 'readInt16LE' : 'readInt16BE';
    case NumberTag.UInt16: return littleEndian ? 'readUInt16LE' : 'readUInt16BE';
    case NumberTag.Int32: return littleEndian ? 'readInt32LE' : 'readInt32BE';
    case NumberTag.UInt32: return littleEndian ? 'readUInt32LE' : 'readUInt32BE';
    case NumberTag.Float32: return littleEndian ? 'readFloatLE' : 'readFloatBE';
    case NumberTag.Float64: return littleEndian ? 'readDoubleLE' : 'readDoubleBE';
    default: throw new TypeError(`Invalid number tag: ${numberTag}`);
  }
}

export function getBufferSetterName(numberTag: NumberTag, littleEndian: boolean) {
  switch (numberTag) {
    case NumberTag.Int8: return 'writeInt8';
    case NumberTag.UInt8: return 'writeUInt8';
    case NumberTag.Int16: return littleEndian ? 'writeInt16LE' : 'writeInt16BE';
    case NumberTag.UInt16: return littleEndian ? 'writeUInt16LE' : 'writeUInt16BE';
    case NumberTag.Int32: return littleEndian ? 'writeInt32LE' : 'writeInt32BE';
    case NumberTag.UInt32: return littleEndian ? 'writeUInt32LE' : 'writeUInt32BE';
    case NumberTag.Float32: return littleEndian ? 'writeFloatLE' : 'writeFloatBE';
    case NumberTag.Float64: return littleEndian ? 'writeDoubleLE' : 'writeDoubleBE';
    default: throw new TypeError(`Invalid number tag: ${numberTag}`);
  }
}

function isArrayBufferView(arg: any): arg is ArrayBufferView {
  return arg.buffer instanceof ArrayBuffer
    && typeof arg.byteOffset === 'number'
    && typeof arg.byteLength === 'number';
}

export type BufferLike = ArrayBuffer | ArrayBufferView;

export function getBuffer(data: BufferLike): Buffer {
  if (Buffer.isBuffer(data)) {
    return data;
  }

  if (data instanceof ArrayBuffer) {
    return Buffer.from(data);
  }

  if (isArrayBufferView(data)) {
    const { buffer, byteOffset, byteLength } = data;
    return Buffer.from(buffer).slice(byteOffset, byteOffset + byteLength);
  }

  throw new TypeError('Invalid input data');
}
