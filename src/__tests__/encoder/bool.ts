import { createEncoder } from '../../encoder';
import { bool } from '../../schemas';

const encode = createEncoder(bool);

test('true', () => {
  const encoded = encode(true);
  const expected = Buffer.from([0x01]);

  expect(encoded.equals(expected)).toBe(true);
});

test('false', () => {
  const encoded = encode(false);
  const expected = Buffer.from([0x00]);

  expect(encoded.equals(expected)).toBe(true);
});
