import { getBuffer } from '../../utils';
import { createView } from '../../view';
import { tuple, uint8 } from '../../schemas';

test('tuple', () => {
  const type = tuple([uint8, uint8, uint8]);

  const view = createView(type);

  expect(view.value.length).toBe(3);
  expect(view.value[0]).toBe(0);
  expect(view.value[1]).toBe(0);
  expect(view.value[2]).toBe(0);

  expect(getBuffer(view).equals(Buffer.from([0, 0, 0]))).toBe(true);

  view.value[0] = 4;
  view.value[1] = 2;
  view.value[2] = 9;

  expect(view.value[0]).toBe(4);
  expect(view.value[1]).toBe(2);
  expect(view.value[2]).toBe(9);

  expect(getBuffer(view).equals(Buffer.from([4, 2, 9]))).toBe(true);
});
