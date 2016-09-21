import test from 'ava';
import { createEncoder } from '../../encoder';
import { bool } from '../../schemas';

const encode = createEncoder(bool);

test('true', t => {
  const encoded = encode(true);
  const expected = Buffer.from([0x01]);

  t.true(encoded.equals(expected));
});

test('false', t => {
  const encoded = encode(false);
  const expected = Buffer.from([0x00]);

  t.true(encoded.equals(expected));
});
