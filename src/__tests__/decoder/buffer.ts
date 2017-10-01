import { pseudoRandomBytes } from 'crypto';
import { createDecoder } from '../../decoder';
import { buffer, struct } from '../../schemas';
import { sizeof } from '../../utils';

test('invalid', () => {
  expect(() => buffer(1, -1)).toThrow();
  expect(() => buffer(1, 3)).toThrow();
  expect(() => buffer(1, 5)).toThrow();
});

test('simple', () => {
  const schema = buffer(100);

  const data = pseudoRandomBytes(schema.byteLength);

  const decode = createDecoder(schema);
  const decoded = decode(data);

  expect(decoded.equals(data)).toBe(true);
});

test('custom alignment', () => {
  const schema = struct({ a: buffer(1, 4), b: buffer(1, 4) });

  expect(schema.fields.b.byteOffset).toBe(4);
});
