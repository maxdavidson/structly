import { pseudoRandomBytes } from 'crypto';
import { createDecoder } from '../../decoder';
import { buffer } from '../../schemas';

test('simple', () => {
  const schema = buffer(100);

  const data = pseudoRandomBytes(schema.byteLength);

  const decode = createDecoder(schema);
  const decoded = decode(data);

  expect(decoded.equals(data)).toBe(true);
});
