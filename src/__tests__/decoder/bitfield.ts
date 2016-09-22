import test from 'ava';
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

test('simple', t => {
  const decoded = decode(buffer);
  t.deepEqual(decoded, data);
});

test('reuse object', t => {
  const result = {};
  const decoded = decode(buffer, result);
  t.is(decoded, result);
  t.deepEqual(decoded, data);
});
