import { getDataView, sizeof, createVariable } from './utils';
import { generateReaderVisitor, generateWriterVisitor } from './visitors';

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
