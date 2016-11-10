import { createDecoder } from '../../decoder';
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
  const decode = createDecoder(schema);

  const str = 'hello world';
  const buffer = createByteString(schema, str);
  const decodedStr = decode(buffer);

  expect(decodedStr).toBe(str);
});

test('string, utf8', () => {
  const schema = string(20, 'utf8');
  const decode = createDecoder(schema);

  const str = '🍔💩';
  const buffer = createByteString(schema, str);
  const decodedStr = decode(buffer);

  expect(decodedStr).toBe(str);
});

test('string, ascii', () => {
  const schema = string(20, 'ascii');
  const decode = createDecoder(schema);

  const str = '🍔💩';
  const buffer = createByteString(schema, str);
  const decodedStr = decode(buffer);

  expect(decodedStr).not.toBe(str);
});
