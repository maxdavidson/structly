import test from 'ava';
import { getBuffer } from '../../utils';
import { createView } from '../../view';
import { bool } from '../../schemas';

test('bool', t => {
  const view = createView(bool);

  t.is(typeof view.value, 'boolean');

  t.false(view.value);
  t.true(getBuffer(view).equals(Buffer.from([0x00])));

  view.value = true;

  t.true(view.value);
  t.true(getBuffer(view).equals(Buffer.from([0x01])));
});
