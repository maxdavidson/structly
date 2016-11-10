import { createEncoder } from '../../encoder';
import { float64 } from '../../schemas';

test('passthrough, Buffer', () => {
  const encode = createEncoder(float64);

  const buffer = Buffer.alloc(float64.byteLength);
  const encoded = encode(42, buffer);

  expect(buffer).toBe(encoded);
});

test('passthrough, ArrayBuffer', () => {
  const encode = createEncoder(float64);

  const buffer = new ArrayBuffer(float64.byteLength);
  const encoded = encode(42, buffer);

  expect(buffer).toBe(encoded);
});

test('passthrough, Float64Array', () => {
  const encode = createEncoder(float64);

  const buffer = new Float64Array([0]);
  const encoded = encode(42, buffer);

  expect(buffer).toBe(encoded);
});

test('no parameters', () => {
  expect(() => (createEncoder as any)()).toThrowError(TypeError);
});

test('no data', () => {
  const encode = createEncoder(float64);
  expect(() => (encode as any)()).toThrowError(TypeError);
});

test('invalid schema', () => {
  const invalidSchema = { tag: 999 };
  expect(() => createEncoder(invalidSchema as any)).toThrowError(TypeError);
});

test('too small buffer', () => {
  const schema = float64;
  const tooSmallBuffer = Buffer.allocUnsafe(schema.byteLength - 1);

  const encode = createEncoder(float64);
  expect(() => encode(25, tooSmallBuffer)).toThrow();
});
