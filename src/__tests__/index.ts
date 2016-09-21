import test from 'ava';
import { endianness } from 'os';
import * as Structly from '..';

test('correct system endianness', t => {
  t.is(Structly.systemLittleEndian, endianness() === 'LE');
});

test('everything is exported', t => {
  t.not(Structly.int8, undefined);
  t.not(Structly.uint8, undefined);
  t.not(Structly.int16, undefined);
  t.not(Structly.uint16, undefined);
  t.not(Structly.int32, undefined);
  t.not(Structly.uint32, undefined);
  t.not(Structly.float32, undefined);
  t.not(Structly.float64, undefined);
  t.not(Structly.array, undefined);
  t.not(Structly.struct, undefined);
  t.not(Structly.tuple, undefined);
  t.not(Structly.bitfield, undefined);
  t.not(Structly.buffer, undefined);
  t.not(Structly.createConverter, undefined);
  t.not(Structly.createEncoder, undefined);
  t.not(Structly.createDecoder, undefined);
  t.not(Structly.createView, undefined);
});
