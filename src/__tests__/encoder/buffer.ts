import { pseudoRandomBytes } from 'crypto';
import { createEncoder } from '../../encoder';
import { buffer } from '../../schemas';

test('simple', () => {
  const schema = buffer(100);

  const data = pseudoRandomBytes(schema.byteLength);

  const encode = createEncoder(schema);
  const encoded = encode(data);

  expect(data.equals(encoded)).toBe(true);
});
