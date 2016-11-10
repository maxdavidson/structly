import { createView } from '../../view';
import { float64 } from '../../schemas';

test('no parameters', () => {
  expect(() => (createView as any)()).toThrowError(TypeError);
});

test('invalid schema', () => {
  const invalidSchema = { tag: -1, byteLength: 1024, byteAlignment: 1 };
  expect(() => (createView as any)(invalidSchema)).toThrowError(TypeError);
});

test('too small buffer', () => {
  const schema = float64;
  const tooSmallBuffer = Buffer.allocUnsafe(schema.byteLength - 1);

  expect(() => createView(float64, tooSmallBuffer)).toThrowError(RangeError);
});
