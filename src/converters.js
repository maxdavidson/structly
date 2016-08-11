/* eslint-disable consistent-return */
import { getDataView, sizeof } from './utils';
import { createReader } from './visitors/reader';
import { createWriter } from './visitors/writer';

let converterCache;
if (typeof WeakMap === 'function') {
  converterCache = new WeakMap();
}

export class Converter {
  constructor(type, { cache = true } = {}) {
    if (type === undefined) {
      throw new TypeError('You must specify a type to convert with');
    }

    // Only enable caching if WeakMap is available
    if (cache && converterCache) {
      if (converterCache.has(type)) {
        return converterCache.get(type);
      }
      converterCache.set(type, this);
    }

    this.type = type;
    this._reader = createReader(type);
    this._writer = createWriter(type);
  }

  decode(buffer, outData, startOffset = 0) {
    const dataView = getDataView(buffer);
    return this._reader(dataView, startOffset, outData);
  }

  encode(sourceData, buffer = new ArrayBuffer(sizeof(this.type)), startOffset = 0) {
    if (sourceData === undefined) {
      throw new TypeError('You must specify the data to encode');
    }

    const dataView = getDataView(buffer);
    this._writer(dataView, startOffset, sourceData);

    if (sizeof(dataView) + startOffset < sizeof(this.type)) {
      throw new RangeError('The provided buffer is too small to store the encoded type');
    }

    return buffer;
  }
}

/**
 * Use a type to decode a buffer, optionally into a target object.
 * @deprecated
 */
export function decode(type, buffer, data, startOffset) {
  return new Converter(type).decode(buffer, data, startOffset);
}

/**
 * Use a type to encode a value, optionally into a target buffer.
 * @deprecated
 */
export function encode(type, data, buffer, startOffset) {
  return new Converter(type).encode(data, buffer, startOffset);
}
