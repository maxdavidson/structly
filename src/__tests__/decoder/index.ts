import test from 'ava';
import { createDecoder } from '../../decoder';
import { float64 } from '../../schemas';

test('no parameters', t => {
  t.throws(() => (createDecoder as any)(), TypeError);
});

test('no data', t => {
  const encode = createDecoder(float64);
  t.throws(() => (encode as any)(), TypeError);
});

test('invalid schema', t => {
  const invalidSchema = { tag: 999 };
  t.throws(() => createDecoder(invalidSchema as any), TypeError);
});
