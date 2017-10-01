import { createUncheckedDecoder } from './decoder';
import { createUncheckedEncoder } from './encoder';
import { Schema, SchemaTag, struct, uint8, RuntimeType, BitfieldSchema, SchemaMap } from './schemas';
import {
  BufferLike, createMask, getBuffer, getBufferGetterName,
  mapValues, sizeof, strideof, systemLittleEndian
} from './utils';

export interface View<T extends Schema> {
  value: RuntimeType<T>;
  readonly schema: T;
  readonly buffer: ArrayBuffer;
  readonly byteLength: T['byteLength'];
  readonly byteOffset: number;
}

/** Create a view object that automatically updates the buffer on modification */
export function createView<T extends Schema>(
  schema: T,
  buffer: BufferLike = Buffer.alloc(sizeof(schema)),
  byteOffset = 0
): View<T> {
  const realBuffer = getBuffer(buffer);

  if (realBuffer.byteLength < sizeof(schema)) {
    throw new RangeError('The provided buffer is too small to store the encoded type');
  }

  const view: any = createProxy(struct({ value: schema }), realBuffer, byteOffset);
  view.schema = schema;
  view.buffer = realBuffer.buffer;
  view.byteOffset = realBuffer.byteOffset;
  view.byteLength = realBuffer.byteLength;

  return view;
}

const SUPPORTS_PROXY = typeof Proxy === 'function';

function createProxy<T extends Schema>(schema: T, buffer: Buffer, byteOffset: number): RuntimeType<T> {
  return (proxyVisitors as any)[schema.tag](schema, buffer, byteOffset);
}

const proxyVisitors: { [Tag in SchemaTag]: (schema: SchemaMap[Tag], buffer: Buffer, byteOffset: number) => RuntimeType<SchemaMap[Tag]>; } = {
  Number({ numberTag, littleEndian = systemLittleEndian }, buffer, byteOffset) {
    const getterName = getBufferGetterName(numberTag, littleEndian);
    return buffer[getterName](byteOffset, true);
  },

  Bool(schema, buffer, byteOffset) {
    return Boolean(createProxy(uint8, buffer, byteOffset));
  },

  String({ byteLength, encoding }, buffer, byteOffset) {
    let index = buffer.indexOf(0, byteOffset);

    if (index < 0 || index >= byteOffset + byteLength) {
      index = byteOffset + byteLength;
    }

    return buffer.slice(byteOffset, index).toString(encoding);
  },

  Array(schema, buffer, byteOffset) {
    const { length, elementSchema } = schema;

    const encode = createUncheckedEncoder(elementSchema);
    const byteStride = strideof(elementSchema);

    return createArrayProxy<RuntimeType<typeof schema>>(length, {
      useProxy: SUPPORTS_PROXY && length > 20,
      get(i) {
        return createProxy(elementSchema, buffer, byteOffset + (byteStride * i));
      },
      set(i, data) {
        encode(data, buffer, byteOffset + (byteStride * i));
      }
    });
  },

  Tuple(schema, buffer, byteOffset) {
    const { fields } = schema;

    const handlers = fields.map(field => ({
      schema: field.schema,
      encode: createUncheckedEncoder(field.schema),
      totalByteOffset: byteOffset + field.byteOffset
    }));

    return createArrayProxy<RuntimeType<typeof schema>>(handlers.length, {
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
  },

  Struct(schema, buffer, byteOffset) {
    const { fields } = schema;

    const membersByName = mapValues(fields, (field, name) => ({
      schema: field.schema,
      encode: createUncheckedEncoder(field.schema),
      totalByteOffset: byteOffset + field.byteOffset
    }));

    return createObjectProxy(fields, {
      get(name) {
        const { schema: fieldSchema, totalByteOffset } = membersByName[name];
        return createProxy(fieldSchema, buffer, totalByteOffset);
      },
      set(name, data) {
        const { encode, totalByteOffset } = membersByName[name];
        encode(data, buffer, totalByteOffset);
      }
    });
  },

  Bitfield(schema, buffer, byteOffset) {
    const { fields, elementSchema } = schema;

    const decode = createUncheckedDecoder(elementSchema);
    const encode = createUncheckedEncoder(elementSchema);

    let currentBitOffset = 0;
    const infoByName = mapValues(fields, bits => {
      const bitOffset = currentBitOffset;
      currentBitOffset += bits;
      const mask = createMask(bits);
      const clearMask = ~(mask << bitOffset);
      return { bitOffset, mask, clearMask };
    });

    return createObjectProxy(fields, {
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
  },

  Buffer(schema, buffer, byteOffset) {
    const { byteLength } = schema;
    return buffer.slice(byteOffset, byteOffset + byteLength);
  }
};

interface ArrayPropertyInterceptor<T extends ArrayLike<any>> {
  useProxy?: boolean;
  get(index: number): T[number];
  set(index: number, data: T[number]): void;
}

function createArrayProxy<T extends ArrayLike<any>>(length: T['length'], { get, set, useProxy = SUPPORTS_PROXY }: ArrayPropertyInterceptor<T>) {
  const newArray = new Array<T[number]>(length);

  // Lazily compute properties if proxy is available
  if (useProxy) {
    return new Proxy(newArray, {
      has(target, key) {
        if (typeof key !== 'symbol') {
          const index = typeof key === 'string' ? parseInt(key, 10) : key;
          if (!isNaN(index)) {
            return (index >= 0) && (index < length);
          }
        }
        return key in target;
      },

      get(target, key: any) {
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
    let getIndex = () => {
      const result = get(i);
      if (typeof result === 'object') {
        getIndex = () => result;
      }
      return result;
    };

    Object.defineProperty(newArray, i, {
      configurable: false,
      enumerable: true,
      get: () => getIndex(),
      set: set.bind(undefined, i)
    });
  }

  return newArray;
}

interface ObjectPropertyInterceptor<T extends object> {
  get<K extends keyof T>(key: K): T[K];
  set<K extends keyof T>(key: K, data: T[K]): void;
}

function createObjectProxy<T extends object>(object: T, { get, set }: ObjectPropertyInterceptor<T>) {
  const keys = Object.keys(object) as (keyof T)[];
  const newObject = {} as T;

  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i];
    let getKey = () => {
      const result = get(key);
      if (typeof result === 'object') {
        getKey = () => result;
      }
      return result;
    };

    Object.defineProperty(newObject, key, {
      configurable: false,
      enumerable: true,
      get: () => getKey(),
      set: set.bind(undefined, key)
    });
  }

  return newObject;
}
