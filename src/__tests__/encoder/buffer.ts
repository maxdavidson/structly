import test from 'ava';
import { pseudoRandomBytes } from 'crypto';
import { createEncoder } from '../../encoder';
import { buffer } from '../../schemas';

test('simple', t => {
  const schema = buffer(100);

  const data = pseudoRandomBytes(schema.byteLength);

  const encode = createEncoder(schema);
  const encoded = encode(data);

  t.true(data.equals(encoded));
});
