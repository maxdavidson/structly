/* eslint-disable max-len, no-param-reassign */
import { strideof, createMask, createVariable } from './utils';

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

