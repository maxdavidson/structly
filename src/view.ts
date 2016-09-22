import { createUncheckedDecoder } from './decoder';
import { createUncheckedEncoder } from './encoder';
import { Schema, SchemaTag, struct, uint8 } from './schemas';
import { BufferLike, createMask, getBuffer, getBufferGetterName, sizeof, strideof, systemLittleEndian } from './utils';

export interface View<T extends Schema> {
  value: any;
  readonly schema: T;
  readonly buffer: ArrayBuffer;
  readonly byteLength: number;
  readonly byteOffset: number;
}

/** Create a view object that automatically updates the buffer on modification */
export function createView<T extends Schema>(
  schema: T,
  buffer: BufferLike = Buffer.alloc(sizeof(schema)),
  byteOffset = 0
): View<T> {
  const realBuffer = getBuffer(buffer);

  if (sizeof(realBuffer) < sizeof(schema)) {
    throw new RangeError('The provided buffer is too small to store the encoded type');
  }

  const view = createProxy(struct({ value: schema }), realBuffer, byteOffset);
  view.schema = schema;
  view.buffer = realBuffer.buffer;
  view.byteOffset = realBuffer.byteOffset;
  view.byteLength = realBuffer.byteLength;

  return view;
}

const SUPPORTS_PROXY = typeof Proxy === 'function';

function createProxy(schema: Schema, buffer: Buffer, byteOffset = 0): any {
  switch (schema.tag) {
    case SchemaTag.Number: {
      const { numberTag, littleEndian = systemLittleEndian } = schema;
      const getterName = getBufferGetterName(numberTag, littleEndian);
      return buffer[getterName](byteOffset, true);
    }

    case SchemaTag.Bool: {
      return Boolean(createProxy(uint8, buffer, byteOffset));
    }

    case SchemaTag.String: {
      const { byteLength, encoding } = schema;

      let index = buffer.indexOf(0, byteOffset);

      if (index < 0 || index >= byteOffset + byteLength) {
        index = byteOffset + byteLength;
      }

      return buffer.slice(byteOffset, index).toString(encoding);
    }

    case SchemaTag.Array: {
      const { length, elementSchema } = schema;

      const encode = createUncheckedEncoder(elementSchema);
      const byteStride = strideof(elementSchema);

      return createArrayProxy(length, {
        useProxy: SUPPORTS_PROXY && length > 20,
        get(i) {
          return createProxy(elementSchema, buffer, byteOffset + (byteStride * i));
        },
        set(i, data) {
          encode(data, buffer, byteOffset + (byteStride * i));
        }
      });
    }

    case SchemaTag.Tuple: {
      const { fields } = schema;

      const handlers = fields.map(field => ({
        schema: field.schema,
        encode: createUncheckedEncoder(field.schema),
        totalByteOffset: byteOffset + field.byteOffset
      }));

      return createArrayProxy(handlers.length, {
        useProxy: false,
        get(i) {
          const { schema: fieldSchema, totalByteOffset } = handlers[i];
          return createProxy(fieldSchema, buffer, totalByteOffset);
        },
        set(i, data) {
          const { encode, totalByteOffset } = handlers[i];
          encode(data, buffer, totalByteOffset);
        }
      });
    }

    case SchemaTag.Struct: {
      const { fields } = schema;

      const membersByName = fields.reduce((obj, field) => {
        obj[field.name] = {
          schema: field.schema,
          encode: createUncheckedEncoder(field.schema),
          totalByteOffset: byteOffset + field.byteOffset
        };
        return obj;
      }, {});

      const fieldNames = fields.map(field => field.name);

      return createObjectProxy(fieldNames, {
        get(name) {
          const { schema: fieldSchema, totalByteOffset } = membersByName[name];
          return createProxy(fieldSchema, buffer, totalByteOffset);
        },
        set(name, data) {
          const { encode, totalByteOffset } = membersByName[name];
          encode(data, buffer, totalByteOffset);
        }
      });
    }

    case SchemaTag.Bitfield: {
      const { fields, elementSchema } = schema;

      const decode = createUncheckedDecoder(elementSchema);
      const encode = createUncheckedEncoder(elementSchema);

      let currentBitOffset = 0;
      const infoByName = fields.reduce((info, { name, bits }) => {
        const bitOffset = currentBitOffset;
        const mask = createMask(bits);
        const clearMask = ~(mask << bitOffset);
        info[name] = { bitOffset, mask, clearMask };
        currentBitOffset += bits;
        return info;
      }, {});

      const fieldNames = fields.map(member => member.name);

      return createObjectProxy(fieldNames, {
        get(name) {
          const { bitOffset, mask } = infoByName[name];
          const elementValue = decode(buffer, undefined, byteOffset);
          return (elementValue >>> bitOffset) & mask;
        },
        set(name, value) {
          const { bitOffset, clearMask, mask } = infoByName[name];
          let elementValue = decode(buffer, undefined, byteOffset);
          elementValue &= clearMask;
          elementValue |= (value & mask) << bitOffset;
          encode(elementValue, buffer, byteOffset);
        }
      });
    }

    case SchemaTag.Buffer: {
      const { byteLength } = schema;
      return buffer.slice(byteOffset, byteOffset + byteLength);
    }

    /* istanbul ignore next */
    default:
      throw new TypeError(`Invalid schema tag: ${(schema as Schema).tag}`);
  }
}

function createArrayProxy(length: number, { get, set, useProxy = SUPPORTS_PROXY }: any = {}) {
  const array = new Array(length);

  // Lazily compute properties if proxy is available
  if (useProxy) {
    return new Proxy(array, {
      has(target, key) {
        if (typeof key !== 'symbol') {
          const index = typeof key === 'string' ? parseInt(key, 10) : key;
          if (!isNaN(index)) {
            return (index >= 0) && (index < length);
          }
        }
        return key in target;
      },

      get(target, key) {
        if (typeof key !== 'symbol') {
          const index = typeof key === 'string' ? parseInt(key, 10) : key;
          if (!isNaN(index) && (index >= 0) && (index < length)) {
            let cache;
            if (key in target) {
              cache = target[key];
            } else {
              cache = get(index);
              if (typeof cache === 'object') {
                target[key] = cache;
              }
            }
            return cache;
          }
        }
        return target[key];
      },

      set(target, key, value) {
        // Check that key is either a number or a numeric string
        if (typeof key !== 'symbol') {
          const index = typeof key === 'string' ? parseInt(key, 10) : key;
          // Check bounds
          if (!isNaN(index) && (index >= 0) && (index < length)) {
            return set(index, value) || true;
          }
        }
        return true;
      }
    });
  }

  // Eagerly compute properties using Object.defineProperty
  for (let i = 0; i < length; ++i) {
    let cache;
    Object.defineProperty(array, i, {
      configurable: false,
      enumerable: true,
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
      set: set.bind(undefined, i)
    });
  }

  return array;
}

function createObjectProxy(keys: string[], { get, set }: any = {}) {
  const object = {};

  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i];
    let cache;
    Object.defineProperty(object, key, {
      configurable: false,
      enumerable: true,
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
      set: set.bind(undefined, key)
    });
  }

  return object;
}
