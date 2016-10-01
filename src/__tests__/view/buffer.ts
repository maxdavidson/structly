import { createView } from '../../view';
import { buffer } from '../../schemas';

test('buffer', () => {
  const view = createView(buffer(100));

  expect(Buffer.isBuffer(view.value)).toBe(true);

  expect(view.buffer).toBe(view.value.buffer);
  expect(view.byteLength).toBe(view.value.byteLength);
  expect(view.byteOffset).toBe(view.value.byteOffset);
});
