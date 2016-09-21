import test from 'ava';
import { createView } from '../../view';
import { string } from '../../schemas';

test('string', t => {
  const view = createView(string(100));

  t.is(typeof view.value, 'string');
  t.is(view.value, '');

  view.value = 'Hello there';
  t.is(view.value, 'Hello there');
});

test('too long string', t => {
  const view = createView(string(3));

  t.is(typeof view.value, 'string');
  t.is(view.value, '');

  view.value = 'Hello there';
  t.is(view.value, 'Hel');
});
