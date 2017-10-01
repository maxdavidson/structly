import { sizeof, strideof, alignof } from '../../utils';
import { SchemaTag, SCHEMA_VERSION, bitfield, uint32, uint8 } from '../../schemas';

test('invalid input', () => {
  expect(() => (bitfield as any)()).toThrowError(TypeError);
  expect(() => (bitfield as any)('bajs')).toThrowError(TypeError);
  expect(() => bitfield({ a: 20, b: 20 })).toThrowError(RangeError);
  expect(() => bitfield({ a: 20, b: 20 }, uint8)).toThrowError(RangeError);
});

test('default storage', () => {
  const schema = bitfield({
    hello: 1,
    there: 7,
    how: 11,
    are: 8,
    you: 5,
  });

  expect(schema.tag).toBe(SchemaTag.Bitfield);
  expect(schema.version).toBe(SCHEMA_VERSION);
  expect(schema.elementSchema).toBe(uint32);
  expect(sizeof(schema)).toBe(sizeof(schema.elementSchema));
  expect(strideof(schema)).toBe(strideof(schema.elementSchema));
  expect(alignof(schema)).toBe(alignof(schema.elementSchema));
});

test('custom storage', () => {
  const schema = bitfield(
    {
      hello: 1,
      there: 7,
    },
    uint8,
  );

  expect(schema.tag).toBe(SchemaTag.Bitfield);
  expect(schema.version).toBe(SCHEMA_VERSION);
  expect(schema.elementSchema).toBe(uint8);
  expect(sizeof(schema)).toBe(sizeof(schema.elementSchema));
  expect(strideof(schema)).toBe(strideof(schema.elementSchema));
  expect(alignof(schema)).toBe(alignof(schema.elementSchema));
});
