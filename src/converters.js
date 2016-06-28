import { readVisitor, writeVisitor } from './visitors';
import { getDataView, sizeof } from './utils';

/**
 * Use a type to decode a buffer, optionally into a target object.
 */
export function decode(type, buffer, data, startOffset = 0) {
  if (type === undefined) {
    throw new TypeError('You must specify a type to decode with');
  }

  const dataView = getDataView(buffer);

  if (sizeof(dataView) + startOffset < sizeof(type)) {
    throw new RangeError('The provided buffer is too small for the type to decode');
  }

  return readVisitor[type.tag](type, dataView, startOffset, data);
}

/**
 * Use a type to encode a value, optionally into a target buffer.
 */
export function encode(type, data, buffer = new ArrayBuffer(sizeof(type)), startOffset = 0) {
  if (type === undefined) {
    throw new TypeError('You must specify a type to encode with');
  }
  if (data === undefined) {
    throw new TypeError('You must specify the data to encode');
  }

  const dataView = getDataView(buffer);

  if (sizeof(dataView) + startOffset < sizeof(type)) {
    throw new RangeError('The provided buffer is too small to store the encoded type');
  }

  writeVisitor[type.tag](type, data, dataView, startOffset);

  return buffer;
}
