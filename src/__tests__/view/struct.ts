import test from 'ava';
import { getBuffer } from '../../utils';
import { createView } from '../../view';
import { struct, array, uint8 } from '../../schemas';

test('struct', t => {
  const type = struct({
    x: uint8,
    y: uint8,
    z: uint8
  });

  const view = createView(type);

  t.is(view.value.x, 0);
  t.is(view.value.y, 0);
  t.is(view.value.z, 0);

  t.true(getBuffer(view).equals(Buffer.from([0, 0, 0])));

  view.value.x = 4;
  view.value.y = 2;
  view.value.z = 9;

  t.is(view.value.x, 4);
  t.is(view.value.y, 2);
  t.is(view.value.z, 9);
  t.false('w' in view.value);
  t.is(view.value.w, undefined);

  t.true(getBuffer(view).equals(getBuffer(Buffer.from([4, 2, 9]))));
});

test('complex struct', t => {
  const view = createView(struct({
    a: struct({
      b: struct({
        c: struct({
          d: struct({
            e: struct({
              f: uint8
            })
          })
        })
      })
    })
  }));

  // Make sure instances are cached by comparing equality of references
  t.is(view.value, view.value);
  t.is(view.value.a, view.value.a);
  t.is(view.value.a.b, view.value.a.b);
  t.is(view.value.a.b.c, view.value.a.b.c);
  t.is(view.value.a.b.c.d, view.value.a.b.c.d);
  t.is(view.value.a.b.c.d.e, view.value.a.b.c.d.e);
  t.is(view.value.a.b.c.d.e.f, view.value.a.b.c.d.e.f);

  t.is(view.byteLength, 1);
  t.is(view.value.a.b.c.d.e.f, 0);
  view.value.a.b.c.d.e.f = 255;
  t.is(view.value.a.b.c.d.e.f, 255);
  t.true(getBuffer(view).equals(getBuffer(Buffer.from([255]))));
});

test('struct of arrays', t => {
  const schema = struct({ x: array(uint8, 3) });
  const view = createView(schema);

  // Caching
  t.is(view.value.x, view.value.x);
});
