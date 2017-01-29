import { sizeof, alignof } from '../../utils';
import { SchemaTag, SCHEMA_VERSION, string } from '../../schemas';

test('throws on invalid input', () => {
  expect(() => (string as any)()).toThrowError(TypeError);
});

test('default args', () => {
  const schema = string(20);

  expect(schema.tag).toBe(SchemaTag.String);
  expect(schema.version).toBe(SCHEMA_VERSION);
  expect(sizeof(schema)).toBe(20);
  expect(alignof(schema)).toBe(1);
  expect(schema.encoding).toBe('utf8');
});

test('ascii', () => {
  const schema = string(10, 'ascii');

  expect(schema.tag).toBe(SchemaTag.String);
  expect(schema.version).toBe(SCHEMA_VERSION);
  expect(sizeof(schema)).toBe(10);
  expect(alignof(schema)).toBe(1);
  expect(schema.encoding).toBe('ascii');
});
