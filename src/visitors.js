/* eslint-disable max-len, no-param-reassign */
import { strideof, decodeBytes, encodeString, createMask } from './utils';

export const readVisitor = {
  Bool(_, dataView, byteOffset) {
    return Boolean(dataView.getUint8(byteOffset));
  },

  Int8(_, dataView, byteOffset) {
    return dataView.getInt8(byteOffset);
  },

  UInt8(_, dataView, byteOffset) {
    return dataView.getUint8(byteOffset);
  },

  Int16({ littleEndian }, dataView, byteOffset) {
    return dataView.getInt16(byteOffset, littleEndian);
  },

  UInt16({ littleEndian }, dataView, byteOffset) {
    return dataView.getUint16(byteOffset, littleEndian);
  },

  Int32({ littleEndian }, dataView, byteOffset) {
    return dataView.getInt32(byteOffset, littleEndian);
  },

  UInt32({ littleEndian }, dataView, byteOffset) {
    return dataView.getUint32(byteOffset, littleEndian);
  },

  UInt64({ littleEndian }, dataView, byteOffset, result = {}) {
    if (littleEndian) {
      result.lo = dataView.getUint32(byteOffset, true);
      result.hi = dataView.getUint32(byteOffset + 4, true);
    } else {
      result.hi = dataView.getUint32(byteOffset, false);
      result.lo = dataView.getUint32(byteOffset + 4, false);
    }
    return result;
  },

  Float32({ littleEndian }, dataView, byteOffset) {
    return dataView.getFloat32(byteOffset, littleEndian);
  },

  Float64({ littleEndian }, dataView, byteOffset) {
    return dataView.getFloat64(byteOffset, littleEndian);
  },

  String({ byteLength, encoding }, dataView, byteOffset) {
    const bytes = new Uint8Array(dataView.buffer, byteOffset, byteLength);
    return decodeBytes(bytes, encoding);
  },

  Array({ byteAlignment, length, element, pack }, dataView, byteOffset, result = new Array(length)) {
    const stride = strideof(element, byteAlignment);
    const readElement = readVisitor[element.tag];
    for (let i = 0, totalOffset = byteOffset; i < length; ++i, totalOffset += stride) {
      result[i] = readElement(element, dataView, totalOffset, result[i]);
    }
    return result;
  },

  Tuple({ members }, dataView, byteOffset, result = new Array(members.length)) {
    for (let i = 0, len = members.length; i < len; ++i) {
      const { element, byteOffset: tupleByteOffset } = members[i];
      const totalOffset = byteOffset + tupleByteOffset;
      result[i] = readVisitor[element.tag](element, dataView, totalOffset, result[i]);
    }
    return result;
  },

  Struct({ members }, dataView, byteOffset, result = {}) {
    for (let i = 0, len = members.length; i < len; ++i) {
      const { name, element, byteOffset: structByteOffset } = members[i];
      const totalOffset = byteOffset + structByteOffset;
      result[name] = readVisitor[element.tag](element, dataView, totalOffset, result[name]);
    }
    return result;
  },

  Bitfield({ element, members }, dataView, byteOffset, result = {}) {
    let value = readVisitor[element.tag](element, dataView, byteOffset);
    for (let i = 0, len = members.length; i < len; ++i) {
      const { name, bits } = members[i];
      result[name] = value & createMask(bits);
      value >>>= bits;
    }
    return result;
  },
};

export const writeVisitor = {
  Bool(_, data, dataView, byteOffset) {
    dataView.setUint8(byteOffset, Number(data));
  },

  Int8(_, data, dataView, byteOffset) {
    dataView.setInt8(byteOffset, data);
  },

  UInt8(_, data, dataView, byteOffset) {
    dataView.setUint8(byteOffset, data);
  },

  Int16({ littleEndian }, data, dataView, byteOffset) {
    dataView.setInt16(byteOffset, data, littleEndian);
  },

  UInt16({ littleEndian }, data, dataView, byteOffset) {
    dataView.setUint16(byteOffset, data, littleEndian);
  },

  Int32({ littleEndian }, data, dataView, byteOffset) {
    dataView.setInt32(byteOffset, data, littleEndian);
  },

  UInt32({ littleEndian }, data, dataView, byteOffset) {
    dataView.setUint32(byteOffset, data, littleEndian);
  },

  UInt64({ littleEndian }, { hi, lo }, dataView, byteOffset) {
    if (littleEndian) {
      dataView.setUint32(byteOffset, lo, true);
      dataView.setUint32(byteOffset + 4, hi, true);
    } else {
      dataView.setUint32(byteOffset, hi, false);
      dataView.setUint32(byteOffset + 4, lo, false);
    }
  },

  Float32({ littleEndian }, data, dataView, byteOffset) {
    dataView.setFloat32(byteOffset, data, littleEndian);
  },

  Float64({ littleEndian }, data, dataView, byteOffset) {
    dataView.setFloat64(byteOffset, data, littleEndian);
  },

  String({ byteLength, encoding }, data, dataView, byteOffset) {
    const bytes = encodeString(data, encoding);
    new Uint8Array(dataView.buffer, byteOffset, byteLength).set(bytes);
  },

  Array({ byteAlignment, length, element }, data, dataView, byteOffset) {
    const stride = strideof(element, byteAlignment);
    const writeElement = writeVisitor[element.tag];
    for (let i = 0, totalOffset = byteOffset; i < length; ++i, totalOffset += stride) {
      writeElement(element, data[i], dataView, totalOffset);
    }
  },

  Tuple({ members }, data, dataView, byteOffset) {
    for (let i = 0, len = members.length; i < len; ++i) {
      const { element, byteOffset: tupleByteOffset } = members[i];
      const totalOffset = byteOffset + tupleByteOffset;
      writeVisitor[element.tag](element, data[i], dataView, totalOffset);
    }
  },

  Struct({ members }, data, dataView, byteOffset) {
    for (let i = 0, len = members.length; i < len; ++i) {
      const { name, element, byteOffset: structByteOffset } = members[i];
      const totalOffset = byteOffset + structByteOffset;
      writeVisitor[element.tag](element, data[name], dataView, totalOffset);
    }
  },

  Bitfield({ element, members }, data, dataView, byteOffset) {
    let result = 0;
    let i = members.length;
    while (i--) {
      const { name, bits } = members[i];
      result <<= bits;
      result |= data[name] & createMask(bits);
    }
    writeVisitor[element.tag](element, result, dataView, byteOffset);
  },
};
