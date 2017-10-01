import { sizeof, strideof, alignof } from '../../utils';
import { SchemaTag, SCHEMA_VERSION, struct, uint8, int16, int32 } from '../../schemas';

test('throw on invalid data', () => {
  expect(() => (struct as any)()).toThrowError(TypeError);
});

test('default', () => {
  const schema = struct({
    a: uint8,
    b: int16,
    c: int32,
    d: uint8,
  });

  expect(schema.tag).toBe(SchemaTag.Struct);
  expect(schema.version).toBe(SCHEMA_VERSION);
  expect(sizeof(schema)).toBe(9);
  expect(strideof(schema)).toBe(12);
  expect(alignof(schema)).toBe(4);

  expect(schema.fields).toEqual({
    a: { schema: uint8, byteOffset: 0 },
    b: { schema: int16, byteOffset: 2 },
    c: { schema: int32, byteOffset: 4 },
    d: { schema: uint8, byteOffset: 8 },
  });
});

test('manually reordered', () => {
  const schema = struct({
    a: uint8,
    d: uint8,
    b: int16,
    c: int32,
  });

  expect(schema.tag).toBe(SchemaTag.Struct);
  expect(schema.version).toBe(SCHEMA_VERSION);
  expect(sizeof(schema)).toBe(8);
  expect(alignof(schema)).toBe(4);

  expect(schema.fields).toEqual({
    a: { schema: uint8, byteOffset: 0 },
    d: { schema: uint8, byteOffset: 1 },
    b: { schema: int16, byteOffset: 2 },
    c: { schema: int32, byteOffset: 4 },
  });
});

test('auto-reordered', () => {
  const type = struct(
    {
      a: uint8,
      b: int16,
      c: int32,
      d: uint8,
    },
    { reorder: true },
  );

  const type2 = struct({
    a: uint8,
    d: uint8,
    b: int16,
    c: int32,
  });

  expect(type).toEqual(type2);
});

test('packed', () => {
  const schema = struct(
    {
      a: uint8,
      b: int16,
      c: int32,
      d: uint8,
    },
    { pack: 1 },
  );

  expect(schema.tag).toBe(SchemaTag.Struct);
  expect(schema.version).toBe(SCHEMA_VERSION);
  expect(sizeof(schema)).toBe(8);
  expect(alignof(schema)).toBe(1);
});
