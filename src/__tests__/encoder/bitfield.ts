import { getBuffer } from '../../utils';
import { createEncoder } from '../../encoder';
import { bitfield } from '../../schemas';

test('simple', () => {
  const schema = bitfield({
    hello: 1,
    there: 7,
    how: 11,
    are: 8,
    you: 5,
  });

  const data = {
    hello: 1,
    there: 2,
    how: 3,
    are: 4,
    you: 5,
  };

  const encode = createEncoder(schema);
  const encoded = encode(data);
  const expected = getBuffer(new Uint32Array([673186565]));

  expect(encoded.equals(expected)).toBe(true);
});
