import { createDecoder } from '../../decoder';
import { getBuffer } from '../../utils';
import { bitfield } from '../../schemas';

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

test('simple', () => {
  const decoded = decode(buffer);
  expect(decoded).toEqual(data);
});

test('reuse object', () => {
  const result = {};
  const decoded = decode(buffer, result);
  expect(decoded).toBe(result);
  expect(decoded).toEqual(data);
});
