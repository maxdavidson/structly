import test from 'ava';
import { sizeof, strideof, alignof } from '../../utils';
import { SchemaTag, array, struct, float32le, float64le, uint8 } from '../../schemas';

test('invalid input', t => {
  t.throws(() => (array as any)(), TypeError);
  t.throws(() => (array as any)(float32le), TypeError);
});

test('default behavior', t => {
  const schema = array(float32le, 10);

  t.is(schema.tag, SchemaTag.Array);
  t.is(schema.length, 10);
  t.is(schema.elementSchema, float32le);

  t.is(sizeof(schema), 40);
  t.is(alignof(schema), 4);
  t.is(strideof(schema), 40);
});

const structSchema = struct({
  a: float64le,
  b: uint8
});

test('correct struct schema', t => {
  t.is(structSchema.tag, SchemaTag.Struct);
  t.is(sizeof(structSchema), 9);
  t.is(alignof(structSchema), 8);
  t.is(strideof(structSchema), 16);
});

test('array of struct, default alignment', t => {
  const schema = array(structSchema, 2);

  t.is(schema.tag, SchemaTag.Array);
  t.is(schema.length, 2);
  t.is(schema.elementSchema, structSchema);

  t.is(sizeof(schema), 16 + 9);
  t.is(alignof(schema), 8);
  t.is(strideof(schema), 16 + 16);
});

test('array of struct, packed', t => {
  const schema = array(structSchema, 2, { pack: true });

  t.is(schema.tag, SchemaTag.Array);
  t.is(schema.length, 2);
  t.is(schema.elementSchema, structSchema);

  t.is(sizeof(schema), 9 + 9);
  t.is(alignof(schema), 1);
  t.is(strideof(schema), 9 + 9);
});

test('array of struct, pack = 1', t => {
  const schema = array(structSchema, 2, { pack: 1 });

  t.is(schema.tag, SchemaTag.Array);
  t.is(schema.length, 2);
  t.is(schema.elementSchema, structSchema);

  t.is(sizeof(schema), 9 + 9);
  t.is(alignof(schema), 1);
  t.is(strideof(schema), 9 + 9);
});

test('array of struct, pack = 2', t => {
  const schema = array(structSchema, 2, { pack: 2 });

  t.is(schema.tag, SchemaTag.Array);
  t.is(schema.length, 2);
  t.is(schema.elementSchema, structSchema);

  t.is(sizeof(schema), 10 + 9);
  t.is(alignof(schema), 2);
  t.is(strideof(schema), 10 + 10);
});

test('array of struct, pack = 4', t => {
  const schema = array(structSchema, 2, { pack: 4 });

  t.is(schema.tag, SchemaTag.Array);
  t.is(schema.length, 2);
  t.is(schema.elementSchema, structSchema);

  t.is(sizeof(schema), 12 + 9);
  t.is(alignof(schema), 4);
  t.is(strideof(schema), 12 + 12);
});
