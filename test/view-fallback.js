import test from 'ava';
import { struct, array, uint8, createView as createViewRaw } from '../';

function createView(type, buffer) {
  return createViewRaw(type, buffer, false);
}

test('array', t => {
  const type = array(uint8, 3);

  const view = createView(type);

  t.true('length' in view.value);
  t.is(view.value.length, 3);
  t.is(view.value[0], 0);
  t.is(view.value[1], 0);
  t.is(view.value[2], 0);

  t.deepEqual(new Uint8Array(view.buffer), new Uint8Array([0, 0, 0]));

  view.value[0] = 4;
  view.value[1] = 2;
  view.value[2] = 9;

  t.throws(() => {
    view.value[3] = 42;
  });

  t.is(view.value[0], 4);
  t.is(view.value[1], 2);
  t.is(view.value[2], 9);
  t.not(3 in view.value);
  t.is(view.value[3], undefined);

  t.deepEqual(new Uint8Array(view.buffer), new Float32Array([4, 2, 9]));
});

test('array of structs', t => {
  const type = array(struct({ x: uint8 }), 3);

  const view = createView(type);

  // Caching
  t.is(view.value[0], view.value[0]);
});

test('struct of arrays', t => {
  const type = struct({ x: array(uint8, 3) });

  const view = createView(type);

  // Caching
  t.is(view.value.x, view.value.x);
});
