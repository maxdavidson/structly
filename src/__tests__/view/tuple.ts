import test from 'ava';
import { getBuffer } from '../../utils';
import { createView } from '../../view';
import { tuple, uint8 } from '../../schemas';

test('tuple', t => {
  const type = tuple(uint8, uint8, uint8);

  const view = createView(type);

  t.is(view.value.length, 3);
  t.is(view.value[0], 0);
  t.is(view.value[1], 0);
  t.is(view.value[2], 0);

  t.true(getBuffer(view).equals(Buffer.from([0, 0, 0])));

  view.value[0] = 4;
  view.value[1] = 2;
  view.value[2] = 9;

  t.is(view.value[0], 4);
  t.is(view.value[1], 2);
  t.is(view.value[2], 9);

  t.true(getBuffer(view).equals(Buffer.from([4, 2, 9])));
});
