import { NumberTag } from '../schemas';
import { align, createMask, getBuffer, getBufferGetterName, getBufferSetterName } from '../utils';

test('align', () => {
  expect(align(9, 4)).toBe(12);
});

test('createMask', () => {
  expect(createMask(0)).toBe(0);
  expect(createMask(32)).toBe(0xffffffff);
});

test('getBuffer', () => {
  expect(() => (getBuffer as any)()).toThrow();
  expect(() => (getBuffer as any)(null)).toThrow();
  expect(() => (getBuffer as any)('232')).toThrow();
  expect(() => (getBuffer as any)(true)).toThrow();
  expect(Buffer.isBuffer(getBuffer(Buffer.alloc(1024)))).toBe(true);
  expect(Buffer.isBuffer(getBuffer(new ArrayBuffer(1024)))).toBe(true);
  expect(Buffer.isBuffer(getBuffer(new Float32Array(24)))).toBe(true);
});

test('getBufferGetterName', () => {
  expect(() => getBufferGetterName(-1 as any, true)).toThrow();
  expect(() => getBufferGetterName(-1 as any, false)).toThrow();

  expect(getBufferGetterName(NumberTag.Int8, true)).toBe('readInt8');
  expect(getBufferGetterName(NumberTag.Int8, false)).toBe('readInt8');
  expect(getBufferGetterName(NumberTag.UInt8, true)).toBe('readUInt8');
  expect(getBufferGetterName(NumberTag.UInt8, false)).toBe('readUInt8');

  expect(getBufferGetterName(NumberTag.Int16, true)).toBe('readInt16LE');
  expect(getBufferGetterName(NumberTag.Int16, false)).toBe('readInt16BE');
  expect(getBufferGetterName(NumberTag.UInt16, true)).toBe('readUInt16LE');
  expect(getBufferGetterName(NumberTag.UInt16, false)).toBe('readUInt16BE');

  expect(getBufferGetterName(NumberTag.Int32, true)).toBe('readInt32LE');
  expect(getBufferGetterName(NumberTag.Int32, false)).toBe('readInt32BE');
  expect(getBufferGetterName(NumberTag.UInt32, true)).toBe('readUInt32LE');
  expect(getBufferGetterName(NumberTag.UInt32, false)).toBe('readUInt32BE');

  expect(getBufferGetterName(NumberTag.Float32, true)).toBe('readFloatLE');
  expect(getBufferGetterName(NumberTag.Float32, false)).toBe('readFloatBE');

  expect(getBufferGetterName(NumberTag.Float64, true)).toBe('readDoubleLE');
  expect(getBufferGetterName(NumberTag.Float64, false)).toBe('readDoubleBE');
});

test('getBufferSetterName', () => {
  expect(() => getBufferSetterName(-1 as any, true)).toThrow();
  expect(() => getBufferSetterName(-1 as any, false)).toThrow();

  expect(getBufferSetterName(NumberTag.Int8, true)).toBe('writeInt8');
  expect(getBufferSetterName(NumberTag.Int8, false)).toBe('writeInt8');
  expect(getBufferSetterName(NumberTag.UInt8, true)).toBe('writeUInt8');
  expect(getBufferSetterName(NumberTag.UInt8, false)).toBe('writeUInt8');

  expect(getBufferSetterName(NumberTag.Int16, true)).toBe('writeInt16LE');
  expect(getBufferSetterName(NumberTag.Int16, false)).toBe('writeInt16BE');
  expect(getBufferSetterName(NumberTag.UInt16, true)).toBe('writeUInt16LE');
  expect(getBufferSetterName(NumberTag.UInt16, false)).toBe('writeUInt16BE');

  expect(getBufferSetterName(NumberTag.Int32, true)).toBe('writeInt32LE');
  expect(getBufferSetterName(NumberTag.Int32, false)).toBe('writeInt32BE');
  expect(getBufferSetterName(NumberTag.UInt32, true)).toBe('writeUInt32LE');
  expect(getBufferSetterName(NumberTag.UInt32, false)).toBe('writeUInt32BE');

  expect(getBufferSetterName(NumberTag.Float32, true)).toBe('writeFloatLE');
  expect(getBufferSetterName(NumberTag.Float32, false)).toBe('writeFloatBE');

  expect(getBufferSetterName(NumberTag.Float64, true)).toBe('writeDoubleLE');
  expect(getBufferSetterName(NumberTag.Float64, false)).toBe('writeDoubleBE');
});
