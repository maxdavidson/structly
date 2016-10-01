import { createEncoder } from '../../encoder';
import { StringSchema, string } from '../../schemas';

test('invalid', () => {
  expect(() => (string as any)()).toThrowError(TypeError);
});

function createByteString({ byteLength, encoding }: StringSchema, str: string) {
  const buffer = Buffer.alloc(byteLength);
  Buffer.from(str, encoding).copy(buffer, 0, 0, byteLength);
  return buffer;
}

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
