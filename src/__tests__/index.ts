import { endianness } from 'os';
import * as Structly from '..';

test('correct system endianness', () => {
  expect(Structly.systemLittleEndian).toBe(endianness() === 'LE');
});

test('everything is exported', () => {
  expect(Structly.int8).toBeDefined();
  expect(Structly.uint8).toBeDefined();
  expect(Structly.int16).toBeDefined();
  expect(Structly.uint16).toBeDefined();
  expect(Structly.int32).toBeDefined();
  expect(Structly.uint32).toBeDefined();
  expect(Structly.float32).toBeDefined();
  expect(Structly.float64).toBeDefined();
  expect(Structly.array).toBeDefined();
  expect(Structly.struct).toBeDefined();
  expect(Structly.tuple).toBeDefined();
  expect(Structly.bitfield).toBeDefined();
  expect(Structly.buffer).toBeDefined();
  expect(Structly.createConverter).toBeDefined();
  expect(Structly.createEncoder).toBeDefined();
  expect(Structly.createDecoder).toBeDefined();
  expect(Structly.createView).toBeDefined();
});
