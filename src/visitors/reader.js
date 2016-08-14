/* eslint-disable max-len, no-new-func */
import { strideof, createMask, createVariable } from '../utils';

export const readerVisitor = Object.freeze({
  Number({ littleEndian, kind }, stackDepth) {
    const resultVar = createVariable('result', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);

    return `${resultVar} = dataView.get${kind}(${byteOffsetVar}, ${littleEndian});`;
  },

  Boolean(_, stackDepth) {
    const resultVar = createVariable('result', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);

    return `${resultVar} = Boolean(dataView.getUint8(${byteOffsetVar}));`;
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
      ${(() => {
        if (typeof Buffer === 'function') {
          return `${resultVar} = new Buffer(${arrayVar}).toString(${JSON.stringify(encoding)});`;
        }

        /* istanbul ignore next */
        if (typeof TextDecoder === 'function') {
          return `${resultVar} = new TextDecoder(${JSON.stringify(encoding)}).decode(${arrayVar});`;
        }

        /* istanbul ignore next */
        return `${resultVar} = String.fromCharCode.apply(String, ${arrayVar});`;
      })()}
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
        ${readerVisitor[element.tag](element, innerStackDepth)}
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
        ${readerVisitor[element.tag](element, innerStackDepth)}
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
        ${readerVisitor[element.tag](element, innerStackDepth)}
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
      ${readerVisitor[element.tag](element, innerStackDepth)}
      ${members.map(({ name, bits }) => `
        ${resultVar}[${JSON.stringify(name)}] = ${innerResultVar} & ${createMask(bits)};
        ${innerResultVar} >>>= ${bits};
      `).join('\n')}
    `;
  },

  Buffer({ byteLength }, stackDepth) {
    const resultVar = createVariable('result', stackDepth);
    const byteOffsetVar = createVariable('byteOffset', stackDepth);

    return `
      if (${resultVar} === void 0 ||
          ${resultVar}.buffer !== dataView.buffer ||
          ${resultVar}.byteLength !== ${byteOffsetVar} ||
          ${resultVar}.byteOffset !== ${byteLength}) {
        ${resultVar} = new Uint8Array(dataView.buffer, ${byteOffsetVar}, ${byteLength});
      }
    `;
  },
});

export function createReader(type) {
  const resultVar = createVariable('result');
  const byteOffsetVar = createVariable('byteOffset');

  return new Function('dataView', byteOffsetVar, resultVar, `
    "use strict";
    ${readerVisitor[type.tag](type, 0)}
    return ${resultVar};
  `);
}
