import test from 'ava';
import { createDecoder } from '../../decoder';
import { struct, float32le } from '../../schemas';

const schema = struct({
  x: float32le,
  y: float32le,
  z: float32le
});

const decode = createDecoder(schema);

const data = {
  x: -1,
  y: 0,
  z: Infinity
};

const buffer = Buffer.alloc(schema.byteLength);
buffer.writeFloatLE(-1, 0);
buffer.writeFloatLE(0, 4);
buffer.writeFloatLE(Infinity, 8);

test('simple', t => {
  const decoded = decode(buffer);
  t.deepEqual(decoded, data);
});

test('resuse object', t => {
  const result = {};
  const decoded = decode(buffer, result);
  t.deepEqual(decoded, data);
  t.is(decoded, result);
});
