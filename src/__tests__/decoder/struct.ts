import { createDecoder } from '../../decoder';
import { struct, float32le } from '../../schemas';

const schema = struct({
  x: float32le,
  y: float32le,
  z: float32le,
});

const decode = createDecoder(schema);

const data = {
  x: -1,
  y: 0,
  z: Infinity,
};

const buffer = Buffer.alloc(schema.byteLength);
buffer.writeFloatLE(-1, 0);
buffer.writeFloatLE(0, 4);
buffer.writeFloatLE(Infinity, 8);

test('simple', () => {
  const decoded = decode(buffer);
  expect(decoded).toEqual(data);
});

test('resuse object', () => {
  const result = {};
  const decoded = decode(buffer, result);
  expect(decoded).toEqual(data);
  expect(decoded).toBe(result);
});
