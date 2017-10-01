import { decodeHelper } from '../_helpers';
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

test(
  'int8',
  decodeHelper(int8, [-129, -128, -127, -1, 0, 1, 126, 127, 128], [127, -128, -127, -1, 0, 1, 126, 127, -128]),
);

test('uint8', decodeHelper(uint8, [-1, 0, 1, 254, 255, 256], [255, 0, 1, 254, 255, 0]));

const int16TestValues = [-32769, -32768, -32767, -1, 0, 1, 32766, 32767, 32768];

const int16ExpectedValues = [32767, -32768, -32767, -1, 0, 1, 32766, 32767, -32768];

test('int16, system endianness', decodeHelper(int16, int16TestValues, int16ExpectedValues));
test('int16, little endian', decodeHelper(int16le, int16TestValues, int16ExpectedValues, true));
test('int16, big endian', decodeHelper(int16be, int16TestValues, int16ExpectedValues, false));

const uint16TestValues = [-1, 0, 1, 65534, 65535, 65536];

const uint16ExpectedValues = [65535, 0, 1, 65534, 65535, 0];

test('uint16, system endianness', decodeHelper(uint16, uint16TestValues, uint16ExpectedValues));
test('uint16, little endian', decodeHelper(uint16le, uint16TestValues, uint16ExpectedValues, true));
test('uint16, big endian', decodeHelper(uint16be, uint16TestValues, uint16ExpectedValues, false));

const int32TestValues = [-2147483649, -2147483648, -2147483647, -1, 0, 1, 2147483646, 2147483647, 2147483648];

const int32ExpectedValues = [2147483647, -2147483648, -2147483647, -1, 0, 1, 2147483646, 2147483647, -2147483648];

test('int32, system endianness', decodeHelper(int32, int32TestValues, int32ExpectedValues));
test('int32, little endian', decodeHelper(int32le, int32TestValues, int32ExpectedValues, true));
test('int32, big endian', decodeHelper(int32be, int32TestValues, int32ExpectedValues, false));

const uint32TestValues = [-1, 0, 1, 4294967294, 4294967295, 4294967296];

const uint32ExpectedValues = [4294967295, 0, 1, 4294967294, 4294967295, 0];

test('uint32, system endianness', decodeHelper(uint32, uint32TestValues, uint32ExpectedValues));
test('uint32, little endian', decodeHelper(uint32le, uint32TestValues, uint32ExpectedValues, true));
test('uint32, big endian', decodeHelper(uint32be, uint32TestValues, uint32ExpectedValues, false));

const MIN_VALUE_F32 = Math.pow(2, -126);
const MAX_VALUE_F32 = (1 - Math.pow(2, -24)) * Math.pow(2, 128);

const float32TestValues = [-Infinity, -0, 0, MIN_VALUE_F32, MAX_VALUE_F32, Infinity];

test('float32, system endianness', decodeHelper(float32, float32TestValues, float32TestValues));
test('float32, little endian', decodeHelper(float32le, float32TestValues, float32TestValues, true));
test('float32, big endian', decodeHelper(float32be, float32TestValues, float32TestValues, false));

const float64TestValues = [-Infinity, -0, 0, Number.MIN_VALUE, Number.MAX_VALUE, Infinity];

test('float64, system endianness', decodeHelper(float64, float64TestValues, float64TestValues));
test('float64, little endian', decodeHelper(float64le, float64TestValues, float64TestValues, true));
test('float64, big endian', decodeHelper(float64be, float64TestValues, float64TestValues, false));
