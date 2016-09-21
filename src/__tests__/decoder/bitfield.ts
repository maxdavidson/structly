import test from 'ava';
import { createDecoder } from '../../decoder';
import { getBuffer } from '../../utils';
import { bitfield } from '../../schemas';

test('simple', t => {
  const schema = bitfield({
    hello: 1,
    there: 7,
    how: 11,
    are: 8,
    you: 5
  });

  const data = {
    hello: 1,
    there: 2,
    how: 3,
    are: 4,
    you: 5
  };

  const buffer = getBuffer(new Uint32Array([673186565]));

  const decode = createDecoder(schema);
  const decoded = decode(buffer);

  t.deepEqual(decoded, data);
});
