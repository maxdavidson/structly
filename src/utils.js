/**
 * Whether the running system is little endian (true = LE, false = BE)
 */
export const systemLittleEndian = (typeof os === 'object')
  /* eslint-disable no-undef */
  ? os.endianness() === 'LE'
  /* eslint-enable no-undef */
  : new Uint32Array(new Uint8Array([0x11, 0x22, 0x33, 0x44]).buffer)[0] === 0x44332211;

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
  if (data instanceof DataView) {
    return data;
  } else if (data instanceof ArrayBuffer) {
    return new DataView(data);
  } else if (ArrayBuffer.isView(data)) {
    const { buffer, byteOffset, byteLength } = data;
    return new DataView(buffer, byteOffset, byteLength);
  }
  throw new TypeError('Invalid input data');
}
// Memoize if WeakMap if supported, otherwise passthrough
export const maybeMemoize = (() => {
  if (typeof WeakMap === 'function') {
    return function memoize(fn) {
      const cache = new WeakMap();
      return function memoized(key) {
        if (!cache.has(key)) {
          cache.set(key, fn(key));
        }
        return cache.get(key);
      };
    };
  }
  /* istanbul ignore next */
  return function passthrough(fn) {
    return fn;
  };
})();
