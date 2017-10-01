import { sizeof, strideof, alignof } from '../../utils';
import { SchemaTag, array, struct, float32le, float64le, uint8 } from '../../schemas';

test('invalid input', () => {
  expect(() => (array as any)()).toThrowError(TypeError);
  expect(() => (array as any)(float32le)).toThrowError(TypeError);
});

test('default behavior', () => {
  const schema = array(float32le, 10);

  expect(schema.tag).toBe(SchemaTag.Array);
  expect(schema.length).toBe(10);
  expect(schema.elementSchema).toBe(float32le);

  expect(sizeof(schema)).toBe(40);
  expect(alignof(schema)).toBe(4);
  expect(strideof(schema)).toBe(40);
});

const structSchema = struct({
  a: float64le,
  b: uint8,
});

test('correct struct schema', () => {
  expect(structSchema.tag).toBe(SchemaTag.Struct);
  expect(sizeof(structSchema)).toBe(9);
  expect(alignof(structSchema)).toBe(8);
  expect(strideof(structSchema)).toBe(16);
});

test('array of struct, default alignment', () => {
  const schema = array(structSchema, 2);

  expect(schema.tag).toBe(SchemaTag.Array);
  expect(schema.length).toBe(2);
  expect(schema.elementSchema).toBe(structSchema);

  expect(sizeof(schema)).toBe(16 + 9);
  expect(alignof(schema)).toBe(8);
  expect(strideof(schema)).toBe(16 + 16);
});

test('array of struct, packed', () => {
  const schema = array(structSchema, 2, { pack: true });

  expect(schema.tag).toBe(SchemaTag.Array);
  expect(schema.length).toBe(2);
  expect(schema.elementSchema).toBe(structSchema);

  expect(sizeof(schema)).toBe(9 + 9);
  expect(alignof(schema)).toBe(1);
  expect(strideof(schema)).toBe(9 + 9);
});

test('array of struct, pack = 1', () => {
  const schema = array(structSchema, 2, { pack: 1 });

  expect(schema.tag).toBe(SchemaTag.Array);
  expect(schema.length).toBe(2);
  expect(schema.elementSchema).toBe(structSchema);

  expect(sizeof(schema)).toBe(9 + 9);
  expect(alignof(schema)).toBe(1);
  expect(strideof(schema)).toBe(9 + 9);
});

test('array of struct, pack = 2', () => {
  const schema = array(structSchema, 2, { pack: 2 });

  expect(schema.tag).toBe(SchemaTag.Array);
  expect(schema.length).toBe(2);
  expect(schema.elementSchema).toBe(structSchema);

  expect(sizeof(schema)).toBe(10 + 9);
  expect(alignof(schema)).toBe(2);
  expect(strideof(schema)).toBe(10 + 10);
});

test('array of struct, pack = 4', () => {
  const schema = array(structSchema, 2, { pack: 4 });

  expect(schema.tag).toBe(SchemaTag.Array);
  expect(schema.length).toBe(2);
  expect(schema.elementSchema).toBe(structSchema);

  expect(sizeof(schema)).toBe(12 + 9);
  expect(alignof(schema)).toBe(4);
  expect(strideof(schema)).toBe(12 + 12);
});
