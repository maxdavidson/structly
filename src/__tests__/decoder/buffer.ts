import test from 'ava';
import { pseudoRandomBytes } from 'crypto';
import { createDecoder } from '../../decoder';
import { buffer } from '../../schemas';

test('simple', t => {
  const schema = buffer(100);

  const data = pseudoRandomBytes(schema.byteLength);

  const decode = createDecoder(schema);
  const decoded = decode(data);

  t.true(decoded.equals(data));
});
