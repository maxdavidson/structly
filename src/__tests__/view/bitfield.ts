import { getBuffer } from '../../utils';
import { createView } from '../../view';
import { bitfield } from '../../schemas';

it('bitfield', () => {
  const schema = bitfield({
    hello: 1,
    there: 7,
    how: 11,
    are: 8,
    you: 5,
  });

  const view = createView(schema);

  expect(view.value.hello).toBe(0);
  expect(view.value.there).toBe(0);
  expect(view.value.how).toBe(0);
  expect(view.value.are).toBe(0);
  expect(view.value.you).toBe(0);

  expect(getBuffer(view).equals(getBuffer(new Uint32Array([0])))).toBe(true);

  view.value.hello = 1;
  view.value.there = 2;
  view.value.how = 3;
  view.value.are = 4;
  view.value.you = 5;

  expect(view.value.hello).toBe(1);
  expect(view.value.there).toBe(2);
  expect(view.value.how).toBe(3);
  expect(view.value.are).toBe(4);
  expect(view.value.you).toBe(5);

  const expectedValue =
    (1 & 0b1) |
    ((2 & 0b1111111) << 1) |
    ((3 & 0b11111111111) << (1 + 7)) |
    ((4 & 0b11111111) << (1 + 7 + 11)) |
    ((5 % 0b11111) << (1 + 7 + 11 + 8));

  expect(getBuffer(view).equals(getBuffer(new Uint32Array([expectedValue])))).toBe(true);
});
