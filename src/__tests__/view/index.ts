import test from 'ava';
import { createView } from '../../view';
import { float64 } from '../../schemas';

test('no parameters', t => {
  t.throws(() => (createView as any)(), TypeError);
});

test('invalid schema', t => {
  const invalidSchema = { tag: -1, byteLength: 1024, byteAlignment: 1 };
  t.throws(() => (createView as any)(invalidSchema), TypeError);
});

test('too small buffer', t => {
  const schema = float64;
  const tooSmallBuffer = Buffer.allocUnsafe(schema.byteLength - 1);

  t.throws(() => createView(float64, tooSmallBuffer), RangeError);
});
