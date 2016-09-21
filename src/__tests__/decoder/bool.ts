import test from 'ava';
import { createDecoder } from '../../decoder';
import { bool } from '../../schemas';

const decode = createDecoder(bool);

test('true', t => {
  const buffer = Buffer.from([0x01]);
  const decoded = decode(buffer);

  t.true(decoded);
});

test('false', t => {
  const buffer = Buffer.from([0x00]);
  const decoded = decode(buffer);

  t.false(decoded);
});
