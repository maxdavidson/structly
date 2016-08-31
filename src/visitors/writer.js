/* eslint-disable max-len, no-new-func */
import { strideof, createMask, createVariable, getBufferKind } from '../utils';
import { uint8 } from '../types';

export const writerVisitor = Object.freeze({
  Number({ littleEndian, kind }, stackDepth) {
    const dataVar = createVariable('data', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);
    const bufferKind = getBufferKind(kind, littleEndian);

    return `buffer.write${bufferKind}(${dataVar}, ${byteOffsetVar}, true);`;
  },

  Boolean(_, stackDepth) {
    const dataVar = createVariable('data', stackDepth);

    return `
      ${dataVar} = Number(${dataVar});
      ${writerVisitor.Number(uint8, stackDepth)}
    `;
  },

  String({ byteLength, encoding }, stackDepth) {
    const dataVar = createVariable('data', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);

    return `
      new Buffer(${dataVar}, ${JSON.stringify(encoding)}).copy(buffer, ${byteOffsetVar}, 0, ${byteLength});
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

  Buffer({ byteLength }, stackDepth) {
    const dataVar = createVariable('data', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);

    return `
      if (${dataVar}.buffer !== buffer.buffer ||
          ${dataVar}.byteOffset !== ${byteOffsetVar} ||
          ${dataVar}.byteLength !== ${byteLength}) {
        new Buffer(${dataVar}).copy(buffer, ${byteOffsetVar}, 0, ${byteLength});
      }
    `;
  },
});

export function createWriter(type) {
  const dataVar = createVariable('data');
  const byteOffsetVar = createVariable('byteOffset');

  return new Function('buffer', byteOffsetVar, dataVar, `
    "use strict";
    ${writerVisitor[type.tag](type, 0)}
  `);
}
