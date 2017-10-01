import { createEncoder } from '../../encoder';
import { struct, float32le } from '../../schemas';

test('simple', () => {
  const schema = struct({
    x: float32le,
    y: float32le,
    z: float32le,
  });

  const encode = createEncoder(schema);

  const data = {
    x: -1,
    y: 0,
    z: Infinity,
  };

  const expected = Buffer.alloc(schema.byteLength);
  expected.writeFloatLE(-1, 0);
  expected.writeFloatLE(0, 4);
  expected.writeFloatLE(Infinity, 8);

  const encoded = encode(data);

  expect(encoded.equals(expected)).toBe(true);
});
