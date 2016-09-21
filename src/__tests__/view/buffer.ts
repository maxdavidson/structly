import test from 'ava';
import { createView } from '../../view';
import { buffer } from '../../schemas';

test('buffer', t => {
  const view = createView(buffer(100));

  t.true(Buffer.isBuffer(view.value));

  t.is(view.buffer, view.value.buffer);
  t.is(view.byteLength, view.value.byteLength);
  t.is(view.byteOffset, view.value.byteOffset);
});
