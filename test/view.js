import test from 'ava';
import { struct, array, tuple, bitfield, uint8, createView as createViewRaw } from '../';

function createView(type, buffer, offset) {
  return createViewRaw(type, buffer, offset, true);
}

test('number', t => {
  const view = createView(uint8);
  t.is(view.value, 0);
  t.deepEqual(new Uint8Array(view.buffer), new Uint8Array([0]));
  view.value = 8;
  t.is(view.value, 8);
  t.deepEqual(new Uint8Array(view.buffer), new Uint8Array([8]));
});

test('struct', t => {
  const type = struct({
    x: uint8,
    y: uint8,
    z: uint8,
  });

  const view = createView(type);

  t.is(view.value.x, 0);
  t.is(view.value.y, 0);
  t.is(view.value.z, 0);

  t.deepEqual(new Uint8Array(view.buffer), new Uint8Array([0, 0, 0]));

  view.value.x = 4;
  view.value.y = 2;
  view.value.z = 9;

  t.throws(() => {
    view.value.w = 2;
  });

  t.is(view.value.x, 4);
  t.is(view.value.y, 2);
  t.is(view.value.z, 9);
  t.not('w' in view.value);
  t.is(view.value.w, undefined);

  t.deepEqual(new Uint8Array(view.buffer), new Uint8Array([4, 2, 9]));
});

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

test('tuple', t => {
  const type = tuple(uint8, uint8, uint8);

  const view = createView(type);

  t.is(view.value.length, 3);
  t.is(view.value[0], 0);
  t.is(view.value[1], 0);
  t.is(view.value[2], 0);

  t.deepEqual(new Uint8Array(view.buffer), new Uint8Array([0, 0, 0]));

  view.value[0] = 4;
  view.value[1] = 2;
  view.value[2] = 9;

  t.is(view.value[0], 4);
  t.is(view.value[1], 2);
  t.is(view.value[2], 9);

  t.deepEqual(new Uint8Array(view.buffer), new Float32Array([4, 2, 9]));
});

test('bitfield', t => {
  const type = bitfield({
    hello: 1,
    there: 7,
    how: 11,
    are: 8,
    you: 5,
  });

  const view = createView(type);

  t.is(view.value.hello, 0);
  t.is(view.value.there, 0);
  t.is(view.value.how, 0);
  t.is(view.value.are, 0);
  t.is(view.value.you, 0);

  t.deepEqual(new Uint8Array(view.buffer), new Uint8Array(new Uint32Array([0]).buffer));

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

  t.deepEqual(new Uint8Array(view.buffer), new Uint8Array(new Uint32Array([expectedValue]).buffer));
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
