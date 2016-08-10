/* eslint-disable max-len, no-param-reassign */
import { strideof, decodeBytes, encodeString, createMask, createVariable } from './utils';

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

export const generateReaderVisitor = {
  Bool(_, stackDepth) {
    const resultVar = createVariable('result', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    return `${resultVar} = Boolean(dataView.getUint8(${byteOffsetVar}));`;
  },

  Int8(_, stackDepth) {
    const resultVar = createVariable('result', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    return `${resultVar} = dataView.getInt8(${byteOffsetVar});`;
  },

  UInt8(_, stackDepth) {
    const resultVar = createVariable('result', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    return `${resultVar} = dataView.getUint8(${byteOffsetVar});`;
  },

  Int16({ littleEndian }, stackDepth) {
    const resultVar = createVariable('result', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    return `${resultVar} = dataView.getInt16(${byteOffsetVar}, ${littleEndian});`;
  },

  UInt16({ littleEndian }, stackDepth) {
    const resultVar = createVariable('result', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    return `${resultVar} = dataView.getUint16(${byteOffsetVar}, ${littleEndian});`;
  },

  Int32({ littleEndian }, stackDepth) {
    const resultVar = createVariable('result', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    return `${resultVar} = dataView.getInt32(${byteOffsetVar}, ${littleEndian});`;
  },

  UInt32({ littleEndian }, stackDepth) {
    const resultVar = createVariable('result', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    return `${resultVar} = dataView.getUint32(${byteOffsetVar}, ${littleEndian});`;
  },

  UInt64({ littleEndian }, stackDepth) {
    const resultVar = createVariable('result', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    const lowOffset = littleEndian ? 0 : 4;
    const highOffset = littleEndian ? 4 : 0;
    return `
      if (${resultVar} === void 0) {
        ${resultVar} = {
          hi: undefined,
          lo: undefined
        };
      };
      ${resultVar}.lo = dataView.getUint32(${byteOffsetVar} + ${lowOffset}, ${littleEndian});
      ${resultVar}.hi = dataView.getUint32(${byteOffsetVar} + ${highOffset}, ${littleEndian});
    `;
  },

  Float32({ littleEndian }, stackDepth) {
    const resultVar = createVariable('result', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    return `${resultVar} = dataView.getFloat32(${byteOffsetVar}, ${littleEndian});`;
  },

  Float64({ littleEndian }, stackDepth) {
    const resultVar = createVariable('result', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    return `${resultVar} = dataView.getFloat64(${byteOffsetVar}, ${littleEndian});`;
  },

  String({ byteLength, encoding }, stackDepth) {
    const resultVar = createVariable('result', stackDepth);
    const arrayVar = createVariable('array', stackDepth);
    const indexVar = createVariable('i', stackDepth);

    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    return `
      var ${arrayVar} = new Uint8Array(dataView.buffer, ${byteOffsetVar}, ${byteLength});
      var ${indexVar} = ${arrayVar}.indexOf(0);
      if (${indexVar} >= 0) {
        ${arrayVar} = ${arrayVar}.subarray(0, ${indexVar});
      }
      ${resultVar} = String.fromCharCode.apply(String, ${arrayVar});
    `;
  },

  Array({ byteAlignment, length, element, pack }, stackDepth) {
    const resultVar = createVariable('result', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    const indexVar = createVariable('i', stackDepth);
    const innerStackDepth = stackDepth + 1;
    const innerResultVar = createVariable('result', innerStackDepth);
    const innerByteOffsetVar = createVariable('byteOffset', innerStackDepth);
    const stride = strideof(element, byteAlignment);

    return `
      if (${resultVar} === void 0) {
        ${resultVar} = new Array(${length});
      }
      var ${innerByteOffsetVar} = ${byteOffsetVar};
      for (var ${indexVar} = 0; ${indexVar} < ${length}; ++${indexVar}) {
        var ${innerResultVar} = ${resultVar}[${indexVar}];
        ${generateReaderVisitor[element.tag](element, innerStackDepth)}
        ${resultVar}[${indexVar}] = ${innerResultVar};
        ${innerByteOffsetVar} += ${stride};
      }
    `;
  },

  Tuple({ members }, stackDepth) {
    const resultVar = createVariable('result', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    const innerStackDepth = stackDepth + 1;
    const innerResultVar = createVariable('result', innerStackDepth);
    const innerByteOffsetVar = createVariable('byteOffset', innerStackDepth);

    return `
      if (${resultVar} === void 0) {
        ${resultVar} = new Array(${members.length});
      }
      ${members.map(({ element, byteOffset }, i) => `
        var ${innerResultVar} = ${resultVar}[${i}];
        var ${innerByteOffsetVar} = ${byteOffsetVar} + ${byteOffset};
        ${generateReaderVisitor[element.tag](element, innerStackDepth)}
        ${resultVar}[${i}] = ${innerResultVar};
      `).join('\n')}
    `;
  },

  Struct({ members }, stackDepth) {
    const resultVar = createVariable('result', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    const innerStackDepth = stackDepth + 1;
    const innerResultVar = createVariable('result', innerStackDepth);
    const innerByteOffsetVar = createVariable('byteOffset', innerStackDepth);
    const emptyStruct = `{ ${members.map(({ name }) => `${JSON.stringify(name)}: undefined`).join(', ')} }`;

    return `
      if (${resultVar} === void 0) {
        ${resultVar} = ${emptyStruct};
      }
      ${members.map(({ name, element, byteOffset }) => `
        var ${innerResultVar} = ${resultVar}[${JSON.stringify(name)}];
        var ${innerByteOffsetVar} = ${byteOffsetVar} + ${byteOffset};
        ${generateReaderVisitor[element.tag](element, innerStackDepth)}
        ${resultVar}[${JSON.stringify(name)}] = ${innerResultVar};
      `).join('\n')}
    `;
  },

  Bitfield({ element, members }, stackDepth) {
    const resultVar = createVariable('result', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    const innerStackDepth = stackDepth + 1;
    const innerResultVar = createVariable('result', innerStackDepth);
    const innerByteOffsetVar = createVariable('byteOffset', innerStackDepth);
    const emptyBitfield = `{ ${members.map(({ name }) => `${JSON.stringify(name)}: undefined`).join(', ')} }`;

    return `
      if (${resultVar} === void 0) {
        ${resultVar} = ${emptyBitfield};
      }
      var ${innerByteOffsetVar} = ${byteOffsetVar};
      var ${innerResultVar};
      ${generateReaderVisitor[element.tag](element, innerStackDepth)}
      ${members.map(({ name, bits }) => `
        ${resultVar}[${JSON.stringify(name)}] = ${innerResultVar} & ${createMask(bits)};
        ${innerResultVar} >>>= ${bits};
      `).join('\n')}
    `;
  },
};


export const generateWriterVisitor = {
  Bool(_, stackDepth) {
    const dataVar = createVariable('data', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    return `dataView.setUint8(${byteOffsetVar}, ${dataVar});`;
  },

  Int8(_, stackDepth) {
    const dataVar = createVariable('data', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    return `dataView.setInt8(${byteOffsetVar}, ${dataVar});`;
  },

  UInt8(_, stackDepth) {
    const dataVar = createVariable('data', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    return `dataView.setUint8(${byteOffsetVar}, ${dataVar});`;
  },

  Int16({ littleEndian }, stackDepth) {
    const dataVar = createVariable('data', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    return `dataView.setInt16(${byteOffsetVar}, ${dataVar}, ${littleEndian});`;
  },

  UInt16({ littleEndian }, stackDepth) {
    const dataVar = createVariable('data', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    return `dataView.setUint16(${byteOffsetVar}, ${dataVar}, ${littleEndian});`;
  },

  Int32({ littleEndian }, stackDepth) {
    const dataVar = createVariable('data', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    return `dataView.setInt32(${byteOffsetVar}, ${dataVar}, ${littleEndian});`;
  },

  UInt32({ littleEndian }, stackDepth) {
    const dataVar = createVariable('data', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    return `dataView.setUint32(${byteOffsetVar}, ${dataVar}, ${littleEndian});`;
  },

  UInt64({ littleEndian }, stackDepth) {
    const dataVar = createVariable('data', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    const lowOffset = littleEndian ? 0 : 4;
    const highOffset = littleEndian ? 4 : 0;
    return `
      dataView.setUint32(${byteOffsetVar} + ${lowOffset}, ${dataVar}.lo, ${littleEndian});
      dataView.setUint32(${byteOffsetVar} + ${highOffset}, ${dataVar}.hi, ${littleEndian});
    `;
  },

  Float32({ littleEndian }, stackDepth) {
    const dataVar = createVariable('data', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    return `dataView.setFloat32(${byteOffsetVar}, ${dataVar}, ${littleEndian});`;
  },

  Float64({ littleEndian }, stackDepth) {
    const dataVar = createVariable('data', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    return `dataView.setFloat64(${byteOffsetVar}, ${dataVar}, ${littleEndian});`;
  },

  String({ byteLength, encoding }, stackDepth) {
    const dataVar = createVariable('data', stackDepth);
    const indexVar = createVariable('i', stackDepth);
    const lengthVar = createVariable('length', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);

    return `
      ${dataVar} = new String(${dataVar});
      for (var ${indexVar} = 0, ${lengthVar} = ${dataVar}.length; ${indexVar} < ${lengthVar}; ++${indexVar}) {
        dataView.setUint8(${byteOffsetVar} + ${indexVar}, ${dataVar}.charCodeAt(${indexVar}));
      }
    `;
  },

  Array({ byteAlignment, length, element, pack }, stackDepth) {
    const dataVar = createVariable('data', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    const indexVar = createVariable('i', stackDepth);
    const innerStackDepth = stackDepth + 1;
    const innerDataVar = createVariable('data', innerStackDepth);
    const innerByteOffsetVar = createVariable('byteOffset', innerStackDepth);
    const stride = strideof(element, byteAlignment);

    return `
      var ${innerByteOffsetVar} = ${byteOffsetVar};
      for (var ${indexVar} = 0; ${indexVar} < ${length}; ++${indexVar}) {
        var ${innerDataVar} = ${dataVar}[${indexVar}];
        ${generateWriterVisitor[element.tag](element, innerStackDepth)}
        ${innerByteOffsetVar} += ${stride};
      }
    `;
  },

  Tuple({ members }, stackDepth) {
    const dataVar = createVariable('data', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    const innerStackDepth = stackDepth + 1;
    const innerDataVar = createVariable('data', innerStackDepth);
    const innerByteOffsetVar = createVariable('byteOffset', innerStackDepth);

    return `
      ${members.map(({ element, byteOffset }, i) => `
        var ${innerDataVar} = ${dataVar}[${i}];
        var ${innerByteOffsetVar} = ${byteOffsetVar} + ${byteOffset};
        ${generateWriterVisitor[element.tag](element, innerStackDepth)}
      `).join('\n')}
    `;
  },

  Struct({ members }, stackDepth) {
    const dataVar = createVariable('data', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    const innerStackDepth = stackDepth + 1;
    const innerDataVar = createVariable('data', innerStackDepth);
    const innerByteOffsetVar = createVariable('byteOffset', innerStackDepth);

    return `
      ${members.map(({ name, element, byteOffset }) => `
        var ${innerDataVar} = ${dataVar}[${JSON.stringify(name)}];
        var ${innerByteOffsetVar} = ${byteOffsetVar} + ${byteOffset};
        ${generateWriterVisitor[element.tag](element, innerStackDepth)}
      `).join('\n')}
    `;
  },

  Bitfield({ element, members }, stackDepth) {
    const dataVar = createVariable('data', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    const innerStackDepth = stackDepth + 1;
    const innerDataVar = createVariable('data', innerStackDepth);
    const innerByteOffsetVar = createVariable('byteOffset', innerStackDepth);

    return `
      var ${innerByteOffsetVar} = ${byteOffsetVar};
      var ${innerDataVar} = 0;
      ${members.slice().reverse().map(({ name, bits }) => `
        ${innerDataVar} <<= ${bits};
        ${innerDataVar} |= ${dataVar}[${JSON.stringify(name)}] & ${createMask(bits)};
      `).join('\n')}
      ${generateWriterVisitor[element.tag](element, innerStackDepth)}
    `;
  },
};

