import test from 'ava';
import { createDecoder } from '../../decoder';
import { tuple, float32le, uint16le } from '../../schemas';

const schema = tuple(float32le, uint16le);
const values = [1.5, 2];

const buffer = Buffer.alloc(schema.byteLength);
buffer.writeFloatLE(1.5, 0);
buffer.writeUInt16LE(2, 4);

const decode = createDecoder(schema);

test('tuple', t => {
  const decoded = decode(buffer);
  t.deepEqual(decoded, values);
});

test('invalid schema', t => {
  const invalidSchema = { tag: 999 };
  t.throws(() => createDecoder(invalidSchema as any), TypeError);
});

test('resuse object', t => {
  const result = [];
  const decoded = decode(buffer, result);
  t.deepEqual(decoded, values);
  t.is(decoded, result);
});
