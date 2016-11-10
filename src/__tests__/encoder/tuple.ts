import { createEncoder } from '../../encoder';
import { tuple, float32le, uint16le } from '../../schemas';

test('tuple', () => {
  const schema = tuple(float32le, uint16le);
  const data = [1.5, 2];

  const encode = createEncoder(schema);
  const encoded = encode(data);

  const expected = Buffer.alloc(schema.byteLength);
  expected.writeFloatLE(1.5, 0);
  expected.writeUInt16LE(2, 4);

  expect(encoded.equals(expected)).toBe(true);
});
