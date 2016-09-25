import test from 'ava';
import { createDecoder } from '../../decoder';
import { float64 } from '../../schemas';

test('no parameters', t => {
  t.throws(() => (createDecoder as any)(), TypeError);
});

test('no data', t => {
  const decode = createDecoder(float64);
  t.throws(() => (decode as any)(), TypeError);
});

test('too small buffer', t => {
  const decode = createDecoder(float64);
  const buffer = Buffer.alloc(4);
  t.throws(() => decode(buffer), RangeError);
});

test('invalid schema', t => {
  const invalidSchema = { tag: 999 };
  t.throws(() => createDecoder(invalidSchema as any), TypeError);
});
