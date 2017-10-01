import { createEncoder } from '../../encoder';
import { StringSchema, string } from '../../schemas';
import { createByteString } from '../_helpers';

test('invalid', () => {
  expect(() => (string as any)()).toThrowError(TypeError);
});

test('default args', () => {
  const schema = string(20);
  const encode = createEncoder(schema);

  const data = 'hello world';
  const encoded = encode(data);
  const expected = createByteString(schema, data);

  expect(encoded.equals(expected)).toBe(true);
});

test('string, ascii', () => {
  const schema = string(10, 'ascii');
  const encode = createEncoder(schema);

  const utfString = '🍔💩';
  const encoded = encode(utfString);
  const expected = createByteString(schema, utfString);

  expect(encoded.equals(expected)).toBe(true);
});
