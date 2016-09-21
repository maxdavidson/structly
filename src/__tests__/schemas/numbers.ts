import test from 'ava';
import { numberSchemaHelper } from '../_helpers';
import {
  NumberTag,
  int8, uint8,
  int16, int16le, int16be,
  uint16, uint16le, uint16be,
  int32, int32le, int32be,
  uint32, uint32le, uint32be,
  float32, float32le, float32be,
  float64, float64le, float64be
} from '../../schemas';

test('int8', numberSchemaHelper(int8, NumberTag.Int8, 1));
test('int8', numberSchemaHelper(uint8, NumberTag.UInt8, 1));

test('int16', numberSchemaHelper(int16, NumberTag.Int16, 2));
test('int16le', numberSchemaHelper(int16le, NumberTag.Int16, 2, true));
test('int16be', numberSchemaHelper(int16be, NumberTag.Int16, 2, false));

test('uint16', numberSchemaHelper(uint16, NumberTag.UInt16, 2));
test('uint16le', numberSchemaHelper(uint16le, NumberTag.UInt16, 2, true));
test('uint16be', numberSchemaHelper(uint16be, NumberTag.UInt16, 2, false));

test('int32', numberSchemaHelper(int32, NumberTag.Int32, 4));
test('int32le', numberSchemaHelper(int32le, NumberTag.Int32, 4, true));
test('int32be', numberSchemaHelper(int32be, NumberTag.Int32, 4, false));

test('uint32', numberSchemaHelper(uint32, NumberTag.UInt32, 4));
test('uint32le', numberSchemaHelper(uint32le, NumberTag.UInt32, 4, true));
test('uint32be', numberSchemaHelper(uint32be, NumberTag.UInt32, 4, false));

test('float32', numberSchemaHelper(float32, NumberTag.Float32, 4));
test('float32le', numberSchemaHelper(float32le, NumberTag.Float32, 4, true));
test('float32be', numberSchemaHelper(float32be, NumberTag.Float32, 4, false));

test('float64', numberSchemaHelper(float64, NumberTag.Float64, 8));
test('float64le', numberSchemaHelper(float64le, NumberTag.Float64, 8, true));
test('float64be', numberSchemaHelper(float64be, NumberTag.Float64, 8, false));
