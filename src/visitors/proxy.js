import { createReader } from './reader';
import { createWriter } from './writer';
import { strideof, getDataView, assign, createMask } from '../utils';

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
            if (Reflect.has(target, key)) {
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
        return true;
      },
    });
  }

  // Eagerly compute properties using Object.defineProperty
  for (let i = 0; i < length; ++i) {
    Object.defineProperty(array, i, {
      enumerable: true,
      configurable: false,
      get: get.bind(undefined, i),
      set: set.bind(undefined, i),
    });
  }

  return Object.freeze(array);
}

function createObjectProxy(keys, { get, set, useProxy = SUPPORTS_PROXY } = {}) {
  const object = {};

  // Lazily compute properties if proxy is available
  if (useProxy) {
    // Pre-allocate all properties in object
    for (let i = 0, len = keys.length; i < len; ++i) {
      object[keys[i]] = undefined;
    }

    return new Proxy(object, {
      has(target, key) {
        return key in target;
      },

      get(target, key) {
        if (key in target) {
          let cache = target[key];
          if (cache === undefined) {
            cache = get(key);
            if (typeof cache === 'object') {
              /* eslint-disable no-param-reassign */
              target[key] = cache;
              /* eslint-enable */
            }
          }
          return cache;
        }
        return target[key];
      },

      set(target, key, value) {
        if (key in target) {
          return set(key, value) || true;
        }
        // Don't allow any other properties to be changed
        return true;
      },
    });
  }

  // Eagerly compute properties using Object.defineProperty
  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i];
    Object.defineProperty(object, key, {
      enumerable: true,
      configurable: false,
      get: get.bind(undefined, key),
      set: set.bind(undefined, key),
    });
  }

  return Object.freeze(object);
}

export const proxyVisitor = Object.freeze({
  Number({ littleEndian, kind }, dataView, byteOffset) {
    return dataView[`get${kind}`](byteOffset, littleEndian);
  },

  Array({ length, element }, dataView, byteOffset) {
    const elementProxyHandler = proxyVisitor[element.tag];
    const elementWriter = createWriter(element);
    const byteStride = strideof(element);

    return createArrayProxy(length, {
      get(i) {
        const elementByteOffset = byteOffset + (byteStride * i);
        return elementProxyHandler(element, dataView, elementByteOffset);
      },
      set(i, value) {
        const elementByteOffset = byteOffset + (byteStride * i);
        elementWriter(dataView, elementByteOffset, value);
      },
    });
  },

  Tuple({ members }, dataView, byteOffset) {
    const handlers = members.map(member => ({
      element: member.element,
      proxyHandler: proxyVisitor[member.element.tag],
      writer: createWriter(member.element),
      totalByteOffset: byteOffset + member.byteOffset,
    }));

    return createArrayProxy(members.length, {
      get(i) {
        const { element, proxyHandler, totalByteOffset } = handlers[i];
        return proxyHandler(element, dataView, totalByteOffset);
      },
      set(i, value) {
        const { writer, totalByteOffset } = handlers[i];
        writer(dataView, totalByteOffset, value);
      },
    });
  },

  Struct({ members }, dataView, byteOffset) {
    const names = members.map(member => member.name);
    const membersByName = members.reduce((obj, member) => {
      /* eslint-disable no-param-reassign */
      obj[member.name] = assign({}, member, {
        writer: createWriter(member.element),
        totalByteOffset: byteOffset + member.byteOffset,
        proxyHandler: proxyVisitor[member.element.tag],
      });
      /* eslint-enable */
      return obj;
    }, Object.create(null));

    return createObjectProxy(names, {
      get(name) {
        const { element, proxyHandler, totalByteOffset } = membersByName[name];
        return proxyHandler(element, dataView, totalByteOffset);
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
});

export function createProxy(type, buffer = new ArrayBuffer(type.byteLength), startOffset = 0) {
  const dataView = getDataView(buffer);
  const proxy = proxyVisitor[type.tag](type, dataView, startOffset);
  return {
    proxy,
    buffer: new Uint8Array(dataView.buffer, dataView.byteOffset, dataView.byteLength),
  };
}
