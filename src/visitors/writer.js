/* eslint-disable max-len, no-new-func */
import { strideof, createMask, createVariable } from '../utils';

export const writerVisitor = Object.freeze({
  Number({ littleEndian, kind }, stackDepth) {
    const dataVar = createVariable('data', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);

    return `dataView.set${kind}(${byteOffsetVar}, ${dataVar}, ${littleEndian});`;
  },

  Boolean(_, stackDepth) {
    const dataVar = createVariable('data', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);

    return `dataView.setUint8(${byteOffsetVar}, Number(${dataVar}));`;
  },

  String({ byteLength, encoding }, stackDepth) {
    const dataVar = createVariable('data', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    const indexVar = createVariable('i', stackDepth);
    const lengthVar = createVariable('length', stackDepth);

    if (typeof Buffer === 'function') {
      return `
        new Buffer(${dataVar}, ${JSON.stringify(encoding)}).copy(new Buffer(dataView.buffer, dataView.byteOffset, dataView.byteLength), ${byteOffsetVar});
      `;
    }

    /* istanbul ignore next */
    if (typeof TextEncoder === 'function') {
      return `
        new Uint8Array(dataView.buffer, dataView.byteOffset, dataView.byteLength).set(new TextDecoder(${JSON.stringify(encoding)}).encode(${dataVar}));
      `;
    }

    /* istanbul ignore next */
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
        ${writerVisitor[element.tag](element, innerStackDepth)}
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
        ${writerVisitor[element.tag](element, innerStackDepth)}
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
        ${writerVisitor[element.tag](element, innerStackDepth)}
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
      ${writerVisitor[element.tag](element, innerStackDepth)}
    `;
  },
});

export function createWriter(type) {
  const dataVar = createVariable('data');
  const byteOffsetVar = createVariable('byteOffset');

  return new Function('dataView', byteOffsetVar, dataVar, `
    "use strict";
    ${writerVisitor[type.tag](type, 0)}
  `);
}
