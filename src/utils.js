/**
 * Whether the running system is little endian (true = LE, false = BE)
 */
export const systemLittleEndian = new Uint8Array(new Uint16Array([0xFF00]).buffer)[0] === 0x00;

/**
 * Gets the closest multiple of byteAlignment from byteOffset (base-2 only)
 */
export function align(byteOffset, byteAlignment) {
  /* eslint-disable no-mixed-operators */
  return (byteOffset + byteAlignment - 1) & ~(byteAlignment - 1);
}

/**
 * The byte alignment of the given type
 */
export function alignof({ byteAlignment = 0 } = {}) {
  return byteAlignment;
}

/**
 * The byte size of the type, excluding alignment padding
 */
export function sizeof({ byteLength = 0 } = {}) {
  return byteLength;
}

/**
 * The byte size of the type, including alignment padding
 */
export function strideof(type, byteAlignment = alignof(type)) {
  return align(sizeof(type), byteAlignment);
}

export function createMask(bits) {
  return (bits <= 0) ? 0 : 0xFFFFFFFF >>> (32 - bits);
}

export function createVariable(name, stackDepth = 0) {
  return `${name}${stackDepth}`;
}

/* eslint-disable no-param-reassign, prefer-rest-params, no-restricted-syntax */
export const assign = Object.assign ||/* istanbul ignore next */ function assign(target) {
  if (target == null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }
  target = Object(target);
  for (let index = 1, len = arguments.length; index < len; index++) {
    const source = Object(arguments[index]);
    if (source != null) {
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
  }
  return target;
};

export function getDataView(data) {
  if (data instanceof ArrayBuffer) {
    return new DataView(data);
  } else if (ArrayBuffer.isView(data)) {
    const { buffer, byteOffset, byteLength } = data;
    return new DataView(buffer, byteOffset, byteLength);
  }
  throw new TypeError('Invalid input data');
}
