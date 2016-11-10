import { createDecoder } from '../../decoder';
import { float64 } from '../../schemas';

test('no parameters', () => {
  expect(() => (createDecoder as any)()).toThrowError(TypeError);
});

test('no data', () => {
  const decode = createDecoder(float64);
  expect(() => (decode as any)()).toThrowError(TypeError);
});

test('too small buffer', () => {
  const decode = createDecoder(float64);
  const buffer = Buffer.alloc(4);
  expect(() => decode(buffer)).toThrowError(RangeError);
});

test('invalid schema', () => {
  const invalidSchema = { tag: 999 };
  expect(() => createDecoder(invalidSchema as any)).toThrowError(TypeError);
});
