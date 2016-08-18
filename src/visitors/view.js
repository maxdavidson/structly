import { createReader } from './reader';
import { createWriter } from './writer';
import { sizeof, strideof, getDataView, createMask } from '../utils';

const SUPPORTS_PROXY = typeof Proxy === 'function';

function createArrayProxy(length, { get, set, useProxy = SUPPORTS_PROXY } = {}) {
  const array = new Array(length);

  // Lazily compute properties if proxy is available
  if (useProxy) {
    return new Proxy(array, {
      has(target, key) {
        if (typeof key !== 'symbol' && !isNaN(key)) {
          const index = parseInt(key, 10);
          return (index >= 0) && (index < length);
        }
        return key in target;
      },

      get(target, key) {
        if (typeof key !== 'symbol' && !isNaN(key)) {
          const index = parseInt(key, 10);
          if ((index >= 0) && (index < length)) {
            let cache;
            if (key in target) {
              cache = target[key];
            } else {
              cache = get(index);
              if (typeof cache === 'object') {
                /* eslint-disable no-param-reassign */
                target[key] = cache;
                /* eslint-enable */
              }
            }
            return cache;
          }
        }
        return target[key];
      },

      set(target, key, value) {
        // Check that key is either a number or a numeric string
        if (typeof key !== 'symbol' && !isNaN(key)) {
          const index = parseInt(key, 10);
          // Check bounds
          if ((index >= 0) && (index < length)) {
            return set(index, value) || true;
          }
        }
        // Don't allow any other properties to be changed
        return false;
      },
    });
  }

  // Eagerly compute properties using Object.defineProperty
  for (let i = 0; i < length; ++i) {
    let cache;
    Object.defineProperty(array, i, {
      enumerable: true,
      configurable: false,
      get() {
        if (cache) {
          return cache;
        }
        const result = get(i);
        if (typeof result === 'object') {
          cache = result;
        }
        return result;
      },
      set: set.bind(undefined, i),
    });
  }

  return Object.freeze(array);
}

function createObjectProxy(keys, { get, set } = {}) {
  const object = {};

  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i];
    let cache;
    Object.defineProperty(object, key, {
      enumerable: true,
      configurable: false,
      get() {
        if (cache) {
          return cache;
        }
        const result = get(key);
        if (typeof result === 'object') {
          cache = result;
        }
        return result;
      },
      set: set.bind(undefined, key),
    });
  }

  return Object.freeze(object);
}

export const viewVisitor = Object.freeze({
  Number({ littleEndian, kind }, dataView, byteOffset) {
    return dataView[`get${kind}`](byteOffset, littleEndian);
  },

  Boolean(_, dataView, byteOffset) {
    return Boolean(dataView.getUint8(byteOffset));
  },

  String({ byteLength, encoding }, dataView, byteOffset) {
    let array = new Uint8Array(dataView.buffer, byteOffset, byteLength);

    const index = Array.prototype.indexOf.call(array, 0);
    if (index >= 0) {
      array = array.subarray(0, index);
    }

    if (typeof Buffer === 'function') {
      return new Buffer(array).toString(encoding);
    }

    /* eslint-disable no-undef */
    /* istanbul ignore next */
    if (typeof TextDecoder === 'function') {
      return new TextDecoder(encoding).decode(array);
    }
    /* eslint-enable no-undef */

    /* eslint-disable prefer-spread */
    /* istanbul ignore next */
    return String.fromCharCode.apply(String, array);
    /* eslint-enable prefer-spread */
  },

  Array({ length, element }, dataView, byteOffset, useProxy = length > 20) {
    const elementProxyHandler = viewVisitor[element.tag];
    const elementWriter = createWriter(element);
    const byteStride = strideof(element);

    return createArrayProxy(length, {
      useProxy,
      get(i) {
        const elementByteOffset = byteOffset + (byteStride * i);
        return elementProxyHandler(element, dataView, elementByteOffset, useProxy);
      },
      set(i, value) {
        const elementByteOffset = byteOffset + (byteStride * i);
        elementWriter(dataView, elementByteOffset, value);
      },
    });
  },

  Tuple({ members }, dataView, byteOffset, useProxy) {
    const handlers = members.map(member => ({
      element: member.element,
      proxyHandler: viewVisitor[member.element.tag],
      writer: createWriter(member.element),
      totalByteOffset: byteOffset + member.byteOffset,
    }));

    return createArrayProxy(members.length, {
      useProxy: false,
      get(i) {
        const { element, proxyHandler, totalByteOffset } = handlers[i];
        return proxyHandler(element, dataView, totalByteOffset, useProxy);
      },
      set(i, value) {
        const { writer, totalByteOffset } = handlers[i];
        writer(dataView, totalByteOffset, value);
      },
    });
  },

  Struct({ members }, dataView, byteOffset, useProxy) {
    const names = members.map(member => member.name);
    const membersByName = members.reduce((obj, member) => {
      /* eslint-disable no-param-reassign */
      obj[member.name] = {
        element: member.element,
        writer: createWriter(member.element),
        totalByteOffset: byteOffset + member.byteOffset,
        proxyHandler: viewVisitor[member.element.tag],
      };
      /* eslint-enable */
      return obj;
    }, Object.create(null));

    return createObjectProxy(names, {
      get(name) {
        const { element, proxyHandler, totalByteOffset } = membersByName[name];
        return proxyHandler(element, dataView, totalByteOffset, useProxy);
      },
      set(name, value) {
        const { writer, totalByteOffset } = membersByName[name];
        writer(dataView, totalByteOffset, value);
      },
    });
  },

  Bitfield({ element, members }, dataView, byteOffset) {
    const reader = createReader(element);
    const writer = createWriter(element);

    const names = members.map(member => member.name);

    let currentBitOffset = 0;
    const infoByName = members.reduce((info, { name, bits }) => {
      const bitOffset = currentBitOffset;
      const mask = createMask(bits);
      const clearMask = ~(mask << bitOffset);
      /* eslint-disable no-param-reassign */
      info[name] = { bitOffset, mask, clearMask };
      /* eslint-enable */
      currentBitOffset += bits;
      return info;
    }, Object.create(null));

    return createObjectProxy(names, {
      get(name) {
        const { bitOffset, mask } = infoByName[name];
        const elementValue = reader(dataView, byteOffset);
        return (elementValue >>> bitOffset) & mask;
      },
      set(name, value) {
        const { bitOffset, clearMask, mask } = infoByName[name];
        let elementValue = reader(dataView, byteOffset);
        elementValue &= clearMask;
        elementValue |= (value & mask) << bitOffset;
        writer(dataView, byteOffset, elementValue);
      },
    });
  },

  Buffer({ byteLength }, dataView, byteOffset) {
    return new Uint8Array(dataView.buffer, byteOffset, byteLength);
  },
});

export function createView(type, buffer = new ArrayBuffer(sizeof(type)), useProxy) {
  const dataView = getDataView(buffer);

  const viewHandler = viewVisitor[type.tag];
  const writer = createWriter(type);

  const view = {
    buffer: dataView.buffer,
    byteOffset: dataView.byteOffset,
    byteLength: dataView.byteLength,
  };

  let cache;
  Object.defineProperty(view, 'value', {
    enumerable: true,
    configurable: false,
    get() {
      if (cache) {
        return cache;
      }
      const result = viewHandler(type, dataView, 0, useProxy);
      if (typeof result === 'object') {
        cache = result;
      }
      return result;
    },
    set(value) {
      writer(dataView, 0, value);
    },
  });

  return Object.seal(view);
}
