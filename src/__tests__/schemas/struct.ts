import test from 'ava';
import { sizeof, strideof, alignof } from '../../utils';
import { SchemaTag, struct, uint8, int16, int32 } from '../../schemas';

test('throw on invalid data', t => {
  t.throws(() => (struct as any)(), TypeError);
});

test('default', t => {
  const schema = struct({
    a: uint8,
    b: int16,
    c: int32,
    d: uint8
  });

  t.is(schema.tag, SchemaTag.Struct);
  t.is(sizeof(schema), 9);
  t.is(strideof(schema), 12);
  t.is(alignof(schema), 4);

  t.deepEqual(schema.fields, [
    { name: 'a', schema: uint8, byteOffset: 0 },
    { name: 'b', schema: int16, byteOffset: 2 },
    { name: 'c', schema: int32, byteOffset: 4 },
    { name: 'd', schema: uint8, byteOffset: 8 }
  ]);
});

test('manually reordered', t => {
  const schema = struct({
    a: uint8,
    d: uint8,
    b: int16,
    c: int32
  });

  t.is(schema.tag, SchemaTag.Struct);
  t.is(sizeof(schema), 8);
  t.is(alignof(schema), 4);

  t.deepEqual(schema.fields, [
    { name: 'a', schema: uint8, byteOffset: 0 },
    { name: 'd', schema: uint8, byteOffset: 1 },
    { name: 'b', schema: int16, byteOffset: 2 },
    { name: 'c', schema: int32, byteOffset: 4 }
  ]);
});

test('auto-reordered', t => {
  const type = struct({
    a: uint8,
    b: int16,
    c: int32,
    d: uint8
  }, { reorder: true });

  const type2 = struct({
    a: uint8,
    d: uint8,
    b: int16,
    c: int32
  });

  t.deepEqual(type, type2);
});

test('packed', t => {
  const schema = struct({
    a: uint8,
    b: int16,
    c: int32,
    d: uint8
  }, { pack: 1 });

  t.is(schema.tag, SchemaTag.Struct);
  t.is(sizeof(schema), 8);
  t.is(alignof(schema), 1);
});
