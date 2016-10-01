import { createConverter } from '../converter';
import { float32 } from '../schemas';

test('invalid', () => {
  expect(() => (createConverter as any)()).toThrow();
});

test('default', () => {
  const schema = float32;
  const converter = createConverter(schema);

  expect(converter.schema).toBe(schema);
  expect(typeof converter.decode).toBe('function');
  expect(typeof converter.encode).toBe('function');
});
