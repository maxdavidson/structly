import test from 'ava';
import { createEncoder } from '../../encoder';
import { float64 } from '../../schemas';

test('passthrough, Buffer', t => {
  const encode = createEncoder(float64);

  const buffer = Buffer.alloc(float64.byteLength);
  const encoded = encode(42, buffer);

  t.is(buffer, encoded);
});

test('passthrough, ArrayBuffer', t => {
  const encode = createEncoder(float64);

  const buffer = new ArrayBuffer(float64.byteLength);
  const encoded = encode(42, buffer);

  t.is(buffer, encoded);
});

test('passthrough, Float64Array', t => {
  const encode = createEncoder(float64);

  const buffer = new Float64Array([0]);
  const encoded = encode(42, buffer);

  t.is(buffer, encoded);
});

test('no parameters', t => {
  t.throws(() => (createEncoder as any)(), TypeError);
});

test('no data', t => {
  const encode = createEncoder(float64);
  t.throws(() => (encode as any)(), TypeError);
});

test('invalid schema', t => {
  const invalidSchema = { tag: 999 };
  t.throws(() => createEncoder(invalidSchema as any), TypeError);
});

test('too small buffer', t => {
  const schema = float64;
  const tooSmallBuffer = Buffer.allocUnsafe(schema.byteLength - 1);

  const encode = createEncoder(float64);
  t.throws(() => encode(25, tooSmallBuffer));
});
