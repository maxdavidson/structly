import { SchemaTag, SCHEMA_VERSION, buffer } from '../../schemas';
import { alignof, sizeof } from '../../utils';

test('invalid input', () => {
  expect(() => (buffer as any)()).toThrowError(TypeError);
  expect(() => (buffer as any)('bajs')).toThrowError(TypeError);
});

test('default behavior', () => {
  const schema = buffer(100);

  expect(schema.tag).toBe(SchemaTag.Buffer);
  expect(schema.version).toBe(SCHEMA_VERSION);
  expect(sizeof(schema)).toBe(100);
  expect(alignof(schema)).toBe(1);
});
