/* eslint-disable no-shadow */
import { getDataView, sizeof, maybeMemoize } from './utils';
import { createReader } from './visitors/reader';
import { createWriter } from './visitors/writer';

export { createView } from './visitors/view';

// Since type schemas are immutable, we should always create the same code for the same object
const createReaderMemoized = maybeMemoize(createReader);
const createWriterMemoized = maybeMemoize(createWriter);

/**
 * Create a decode function for converting a buffer into its JavaScript representation
 */
export function createDecoder(type) {
  if (type === undefined) {
    throw new TypeError('You must specify a type to convert with');
  }
  const reader = createReaderMemoized(type);
  return function decode(buffer, data, startOffset = 0) {
    if (buffer === undefined) {
      throw new TypeError('You must specify the buffer the decode');
    }
    const dataView = getDataView(buffer);
    return reader(dataView, startOffset, data);
  };
}

/**
 * Create an encode function for serializing a JavaScript object or value into a buffer
 */
export function createEncoder(type) {
  if (type === undefined) {
    throw new TypeError('You must specify a type to convert with');
  }
  const writer = createWriterMemoized(type);
  return function encode(data, buffer = new ArrayBuffer(sizeof(type)), startOffset = 0) {
    if (data === undefined) {
      throw new TypeError('You must specify the data to encode');
    }
    const dataView = getDataView(buffer);
    if (sizeof(dataView) + startOffset < sizeof(type)) {
      throw new RangeError('The provided buffer is too small to store the encoded type');
    }
    writer(dataView, startOffset, data);
    return buffer;
  };
}

/**
 * Create a converter object that contains both an encoder and a decoder
 */
export function createConverter(type) {
  /* istanbul ignore next */
  const encode = createEncoder(type);
  /* istanbul ignore next */
  const decode = createDecoder(type);
  /* istanbul ignore next */
  return { type, encode, decode };
}

/**
 * Converting a buffer into its JavaScript representation
 * @deprecated
 */
export function decode(type, buffer, data, startOffset) {
  const decode = createDecoder(type);
  return decode(buffer, data, startOffset);
}

/**
 * Serialize a JavaScript object or value into a buffer
 * @deprecated
 */
export function encode(type, data, buffer, startOffset) {
  const encode = createEncoder(type);
  return encode(data, buffer, startOffset);
}
