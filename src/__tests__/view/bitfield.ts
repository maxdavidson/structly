import test from 'ava';
import { getBuffer } from '../../utils';
import { createView } from '../../view';
import { bitfield } from '../../schemas';

test('bitfield', t => {
  const schema = bitfield({
    hello: 1,
    there: 7,
    how: 11,
    are: 8,
    you: 5
  });

  const view = createView(schema);

  t.is(view.value.hello, 0);
  t.is(view.value.there, 0);
  t.is(view.value.how, 0);
  t.is(view.value.are, 0);
  t.is(view.value.you, 0);

  t.true(getBuffer(view).equals(getBuffer(new Uint32Array([0]))));

  view.value.hello = 1;
  view.value.there = 2;
  view.value.how = 3;
  view.value.are = 4;
  view.value.you = 5;

  t.is(view.value.hello, 1);
  t.is(view.value.there, 2);
  t.is(view.value.how, 3);
  t.is(view.value.are, 4);
  t.is(view.value.you, 5);

  const expectedValue =
    (1 & 0b1) | ((2 & 0b1111111) << 1) |
    ((3 & 0b11111111111) << (1 + 7)) |
    ((4 & 0b11111111) << (1 + 7 + 11)) |
    ((5 % 0b11111) << (1 + 7 + 11 + 8));

  t.true(getBuffer(view).equals(getBuffer(new Uint32Array([expectedValue]))));
});
