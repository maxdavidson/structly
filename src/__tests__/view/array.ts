import test from 'ava';
import { getBuffer } from '../../utils';
import { createView } from '../../view';
import { array, struct, uint8 } from '../../schemas';

test('short array', t => {
  const schema = array(uint8, 3);
  const view = createView(schema);

  t.true('length' in view.value);
  t.is(view.value.length, 3);
  t.is(view.value[0], 0);
  t.is(view.value[1], 0);
  t.is(view.value[2], 0);

  t.true(getBuffer(view).equals(Buffer.from([0, 0, 0])));

  view.value[0] = 4;
  view.value[1] = 2;
  view.value[2] = 9;

  t.is(view.value[0], 4);
  t.is(view.value[1], 2);
  t.is(view.value[2], 9);
  t.false(3 in view.value);
  t.is(view.value[3], undefined);

  t.true(getBuffer(view).equals(Buffer.from([4, 2, 9])));
});

test('long array', t => {
  const schema = array(uint8, 100);
  const view = createView(schema);

  t.is(view.value.length, schema.length);
  for (let i = 0; i < schema.length; ++i) {
    t.is(view.value[i], 0);
  }

  t.true(getBuffer(view).equals(Buffer.alloc(schema.length)));

  for (let i = 0; i < schema.length; ++i) {
    view.value[i] = 42;
  }

  for (let i = 0; i < schema.length; ++i) {
    t.is(view.value[i], 42);
  }

  t.true(getBuffer(view).equals(Buffer.alloc(schema.length, 42)));
});

test('array of structs', t => {
  const schema = array(struct({ x: uint8 }), 3);
  const view = createView(schema);

  // Caching
  t.is(view.value[0], view.value[0]);
});
