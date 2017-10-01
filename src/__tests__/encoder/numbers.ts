import { encodeHelper } from '../_helpers';
import {
  int8,
  uint8,
  int16,
  int16le,
  int16be,
  uint16,
  uint16le,
  uint16be,
  int32,
  int32le,
  int32be,
  uint32,
  uint32le,
  uint32be,
  float32,
  float32le,
  float32be,
  float64,
  float64le,
  float64be,
} from '../../schemas';

test('int8', encodeHelper(int8, [-129, -128, -127, -1, 0, 1, 126, 127, 128]));

test('uint8', encodeHelper(uint8, [-1, 0, 1, 254, 255, 256]));

const int16Data = [-32769, -32768, -32767, -1, 0, 1, 32766, 32767, 32768];

test('int16, system endianness', encodeHelper(int16, int16Data));
test('int16, little endian', encodeHelper(int16le, int16Data, true));
test('int16, big endian', encodeHelper(int16be, int16Data, false));

const uint16Data = [-1, 0, 1, 65534, 65535, 65536];

test('uint16, system endianness', encodeHelper(uint16, uint16Data));
test('uint16, little endian', encodeHelper(uint16le, uint16Data, true));
test('uint16, big endian', encodeHelper(uint16be, uint16Data, false));

const int32Data = [2147483647, -2147483648, -2147483647, -1, 0, 1, 2147483646, 2147483647, -2147483648];

test('int32, system endianness', encodeHelper(int32, int32Data));
test('int32, little endian', encodeHelper(int32le, int32Data, true));
test('int32, big endian', encodeHelper(int32be, int32Data, false));

const uint32Data = [-1, 0, 1, 4294967294, 4294967295, 4294967296];

test('uint32, system endianness', encodeHelper(uint32, uint32Data));
test('uint32, little endian', encodeHelper(uint32le, uint32Data, true));
test('uint32, big endian', encodeHelper(uint32be, uint32Data, false));

const MIN_VALUE_F32 = Math.pow(2, -126);
const MAX_VALUE_F32 = (1 - Math.pow(2, -24)) * Math.pow(2, 128);

const float32Data = [-Infinity, -0, 0, MIN_VALUE_F32, MAX_VALUE_F32, Infinity];

test('float32, system endianness', encodeHelper(float32, float32Data));
test('float32, little endian', encodeHelper(float32le, float32Data, true));
test('float32, big endian', encodeHelper(float32be, float32Data, false));

const float64Data = [-Infinity, -0, 0, Number.MIN_VALUE, Number.MAX_VALUE, Infinity];

test('float64, system endianness', encodeHelper(float64, float64Data));
test('float64, little endian', encodeHelper(float64le, float64Data, true));
test('float64, big endian', encodeHelper(float64be, float64Data, false));
