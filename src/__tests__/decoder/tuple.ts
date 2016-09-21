import test from 'ava';
import { createDecoder } from '../../decoder';
import { tuple, float32le, uint16le } from '../../schemas';

test('tuple', t => {
  const schema = tuple(float32le, uint16le);
  const values = [1.5, 2];

  const buffer = Buffer.alloc(schema.byteLength);
  buffer.writeFloatLE(1.5, 0);
  buffer.writeUInt16LE(2, 4);

  const decode = createDecoder(schema);
  const decoded = decode(buffer);

  t.deepEqual(decoded, values);
});
