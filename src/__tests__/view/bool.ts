import { getBuffer } from '../../utils';
import { createView } from '../../view';
import { bool } from '../../schemas';

test('bool', () => {
  const view = createView(bool);

  expect(typeof view.value).toBe('boolean');

  expect(view.value).toBe(false);
  expect(getBuffer(view).equals(Buffer.from([0x00]))).toBe(true);

  view.value = true;

  expect(view.value).toBe(true);
  expect(getBuffer(view).equals(Buffer.from([0x01]))).toBe(true);
});
