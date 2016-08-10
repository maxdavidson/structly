import { getDataView, sizeof, createVariable } from './utils';
import {
  readVisitor, writeVisitor,
  generateReaderVisitor, generateWriterVisitor,
} from './visitors';

/**
 * Use a type to decode a buffer, optionally into a target object.
 * @deprecated
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
 * @deprecated
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

/**
 *
 */
export class Converter {
  constructor(type) {
    if (type === undefined) {
      throw new TypeError('You must specify a type to convert with');
    }

    this.type = type;

    const stackDepth = 0;
    const resultVar = createVariable('result', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    const dataVar = createVariable('data', stackDepth);

    const readerSource = `
      "use strict";
      ${generateReaderVisitor[type.tag](type, stackDepth)}
      return ${resultVar};
    `;

    const writerSource = `
      "use strict";
      ${generateWriterVisitor[type.tag](type, stackDepth)}
    `;

    /* eslint-disable no-new-func */
    this._reader = new Function('dataView', byteOffsetVar, resultVar, readerSource);
    this._writer = new Function('dataView', byteOffsetVar, dataVar, writerSource);
    /* eslint-enable no-new-func */
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
