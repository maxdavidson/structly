import { createDecoder } from '../../decoder';
import { bool } from '../../schemas';

const decode = createDecoder(bool);

test('true', () => {
  const buffer = Buffer.from([0x01]);
  const decoded = decode(buffer);

  expect(decoded).toBe(true);
});

test('false', () => {
  const buffer = Buffer.from([0x00]);
  const decoded = decode(buffer);

  expect(decoded).toBe(false);
});
