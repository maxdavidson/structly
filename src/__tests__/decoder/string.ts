import { createDecoder } from '../../decoder';
import { StringSchema, string } from '../../schemas';
import { createByteString } from '../_helpers';

test('invalid', () => {
  expect(() => (string as any)()).toThrowError(TypeError);
});

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
