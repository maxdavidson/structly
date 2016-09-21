import test from 'ava';
import { createDecoder } from '../../decoder';
import { StringSchema, string } from '../../schemas';

test('invalid', t => {
  t.throws(() => (string as any)(), TypeError);
});

function createByteString({ byteLength, encoding }: StringSchema, str: string) {
  const buffer = Buffer.alloc(byteLength);
  Buffer.from(str, encoding).copy(buffer, 0, 0, byteLength);
  return buffer;
}

test('default args', t => {
  const schema = string(20);
  const decode = createDecoder(schema);

  const str = 'hello world';
  const buffer = createByteString(schema, str);
  const decodedStr = decode(buffer);

  t.is(decodedStr, str);
});

test('string, utf8', t => {
  const schema = string(20, 'utf8');
  const decode = createDecoder(schema);

  const str = '🍔💩';
  const buffer = createByteString(schema, str);
  const decodedStr = decode(buffer);

  t.is(decodedStr, str);
});

test('string, ascii', t => {
  const schema = string(20, 'ascii');
  const decode = createDecoder(schema);

  const str = '🍔💩';
  const buffer = createByteString(schema, str);
  const decodedStr = decode(buffer);

  t.not(decodedStr, str);
});
