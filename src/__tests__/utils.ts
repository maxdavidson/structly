import test from 'ava';
import { NumberTag } from '../schemas';
import { align, createMask, getBuffer, getBufferGetterName, getBufferSetterName } from '../utils';

test('align', t => {
  t.is(align(9, 4), 12);
});

test('createMask', t => {
  t.is(createMask(0), 0);
  t.is(createMask(32), 0xffffffff);
});

test('getBuffer', t => {
  t.throws(() => (getBuffer as any)());
  t.throws(() => (getBuffer as any)(null));
  t.throws(() => (getBuffer as any)('232'));
  t.throws(() => (getBuffer as any)(true));
  t.true(Buffer.isBuffer(getBuffer(Buffer.alloc(1024))));
  t.true(Buffer.isBuffer(getBuffer(new ArrayBuffer(1024))));
  t.true(Buffer.isBuffer(getBuffer(new Float32Array(24))));
});

test('getBufferGetterName', t => {
  t.throws(() => getBufferGetterName(-1, true));
  t.throws(() => getBufferGetterName(-1, false));

  t.is(getBufferGetterName(NumberTag.Int8, true), 'readInt8');
  t.is(getBufferGetterName(NumberTag.Int8, false), 'readInt8');
  t.is(getBufferGetterName(NumberTag.UInt8, true), 'readUInt8');
  t.is(getBufferGetterName(NumberTag.UInt8, false), 'readUInt8');

  t.is(getBufferGetterName(NumberTag.Int16, true), 'readInt16LE');
  t.is(getBufferGetterName(NumberTag.Int16, false), 'readInt16BE');
  t.is(getBufferGetterName(NumberTag.UInt16, true), 'readUInt16LE');
  t.is(getBufferGetterName(NumberTag.UInt16, false), 'readUInt16BE');

  t.is(getBufferGetterName(NumberTag.Int32, true), 'readInt32LE');
  t.is(getBufferGetterName(NumberTag.Int32, false), 'readInt32BE');
  t.is(getBufferGetterName(NumberTag.UInt32, true), 'readUInt32LE');
  t.is(getBufferGetterName(NumberTag.UInt32, false), 'readUInt32BE');

  t.is(getBufferGetterName(NumberTag.Float32, true), 'readFloatLE');
  t.is(getBufferGetterName(NumberTag.Float32, false), 'readFloatBE');

  t.is(getBufferGetterName(NumberTag.Float64, true), 'readDoubleLE');
  t.is(getBufferGetterName(NumberTag.Float64, false), 'readDoubleBE');
});

test('getBufferSetterName', t => {
  t.throws(() => getBufferSetterName(-1, true));
  t.throws(() => getBufferSetterName(-1, false));

  t.is(getBufferSetterName(NumberTag.Int8, true), 'writeInt8');
  t.is(getBufferSetterName(NumberTag.Int8, false), 'writeInt8');
  t.is(getBufferSetterName(NumberTag.UInt8, true), 'writeUInt8');
  t.is(getBufferSetterName(NumberTag.UInt8, false), 'writeUInt8');

  t.is(getBufferSetterName(NumberTag.Int16, true), 'writeInt16LE');
  t.is(getBufferSetterName(NumberTag.Int16, false), 'writeInt16BE');
  t.is(getBufferSetterName(NumberTag.UInt16, true), 'writeUInt16LE');
  t.is(getBufferSetterName(NumberTag.UInt16, false), 'writeUInt16BE');

  t.is(getBufferSetterName(NumberTag.Int32, true), 'writeInt32LE');
  t.is(getBufferSetterName(NumberTag.Int32, false), 'writeInt32BE');
  t.is(getBufferSetterName(NumberTag.UInt32, true), 'writeUInt32LE');
  t.is(getBufferSetterName(NumberTag.UInt32, false), 'writeUInt32BE');

  t.is(getBufferSetterName(NumberTag.Float32, true), 'writeFloatLE');
  t.is(getBufferSetterName(NumberTag.Float32, false), 'writeFloatBE');

  t.is(getBufferSetterName(NumberTag.Float64, true), 'writeDoubleLE');
  t.is(getBufferSetterName(NumberTag.Float64, false), 'writeDoubleBE');
});
