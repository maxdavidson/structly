/* eslint-disable no-param-reassign  */
import { systemLittleEndian, align, assign, alignof } from './utils';

function createNumberType(kind, size, littleEndian = systemLittleEndian) {
  return Object.freeze({
    tag: 'Number',
    kind,
    byteLength: size,
    byteAlignment: size,
    littleEndian,
  });
}

export const int8 = createNumberType('Int8', 1);
export const uint8 = createNumberType('Uint8', 1);

export const int16 = createNumberType('Int16', 2);
export const int16le = createNumberType('Int16', 2, true);
export const int16be = createNumberType('Int16', 2, false);

export const uint16 = createNumberType('Uint16', 2);
export const uint16le = createNumberType('Uint16', 2, true);
export const uint16be = createNumberType('Uint16', 2, false);

export const int32 = createNumberType('Int32', 4);
export const int32le = createNumberType('Int32', 4, true);
export const int32be = createNumberType('Int32', 4, false);

export const uint32 = createNumberType('Uint32', 4);
export const uint32le = createNumberType('Uint32', 4, true);
export const uint32be = createNumberType('Uint32', 4, false);

export const float32 = createNumberType('Float32', 4);
export const float32le = createNumberType('Float32', 4, true);
export const float32be = createNumberType('Float32', 4, false);

export const float64 = createNumberType('Float64', 8);
export const float64le = createNumberType('Float64', 8, true);
export const float64be = createNumberType('Float64', 8, false);

/**
 * Create a string type.
 */
export function string(maxLength, encoding = 'utf8') {
  if (maxLength === undefined) {
    throw new TypeError('You must specify a max length for the string!');
  }

  return Object.freeze({
    tag: 'String',
    byteLength: maxLength,
    byteAlignment: 1,
    encoding,
  });
}

/**
 * Create an array type.
 */
export function array(element, length, { pack } = {}) {
  if (element === undefined) {
    throw new TypeError('You must specify the array element type!');
  }
  if (length === undefined || typeof length !== 'number') {
    throw new TypeError('You must specify a length of the array!');
  }

  return Object.freeze({
    tag: 'Array',
    byteLength: length * element.byteLength,
    byteAlignment: pack || element.byteAlignment,
    length,
    element,
  });
}

function offsetHelper(tag, elements, inject, pack = 0) {
  let byteOffset = 0;
  let maxByteAlignment = 0;

  const members = Object.freeze(elements.map(element => {
    const { byteLength, byteAlignment } = element;

    byteOffset = align(byteOffset, pack || byteAlignment);

    const result = { byteOffset, element };

    if (inject !== undefined) {
      assign(result, inject(element));
    }

    byteOffset += byteLength;
    maxByteAlignment = Math.max(maxByteAlignment, byteAlignment);

    return Object.freeze(result);
  }));

  return Object.freeze({
    tag,
    byteLength: byteOffset,
    byteAlignment: pack || maxByteAlignment,
    members,
  });
}

/**
 * Create a tuple type.
 */
export function tuple(...elements) {
  return offsetHelper('Tuple', elements);
}

function injectName({ name }) {
  return { name };
}

/**
 * Create a struct type.
 */
export function struct(members, { reorder = false, pack = 0 } = {}) {
  if (members === undefined) {
    throw new TypeError('You must specify the struct members!');
  }

  pack = Number(pack);
  const memberNames = Object.keys(members);

  if (reorder) {
    memberNames.sort((a, b) => alignof(members[a]) - alignof(members[b]));
  }

  const sortedMembers = memberNames.map(name => assign({ name }, members[name]));

  return offsetHelper('Struct', sortedMembers, injectName, pack);
}

/**
 * Create a bitfield type.
 */
export function bitfield(members, element = uint32) {
  if (members === undefined) {
    throw new TypeError('You must specify the bitfield members!');
  }

  const memberNames = Object.keys(members);
  const totalBits = memberNames.reduce((sum, name) => sum + members[name], 0);

  if (totalBits > 8 * element.byteLength) {
    throw new RangeError('Sum of bitfield widths is too large for storage element');
  }

  return Object.freeze({
    tag: 'Bitfield',
    byteLength: element.byteLength,
    byteAlignment: element.byteAlignment,
    members: Object.freeze(memberNames.map(name => Object.freeze({ name, bits: members[name] }))),
    element,
  });
}
