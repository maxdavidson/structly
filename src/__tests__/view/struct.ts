import { getBuffer } from '../../utils';
import { createView } from '../../view';
import { struct, array, uint8 } from '../../schemas';

test('struct', () => {
  const type = struct({
    x: uint8,
    y: uint8,
    z: uint8
  });

  const view = createView(type);

  expect(view.value.x).toBe(0);
  expect(view.value.y).toBe(0);
  expect(view.value.z).toBe(0);

  expect(getBuffer(view).equals(Buffer.from([0, 0, 0]))).toBe(true);

  view.value.x = 4;
  view.value.y = 2;
  view.value.z = 9;

  expect(view.value.x).toBe(4);
  expect(view.value.y).toBe(2);
  expect(view.value.z).toBe(9);
  expect('w' in view.value).toBe(false);
  expect(view.value.w).toBe(undefined);

  expect(getBuffer(view).equals(getBuffer(Buffer.from([4, 2, 9])))).toBe(true);
});

test('complex struct', () => {
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
  expect(view.value).toBe(view.value);
  expect(view.value.a).toBe(view.value.a);
  expect(view.value.a.b).toBe(view.value.a.b);
  expect(view.value.a.b.c).toBe(view.value.a.b.c);
  expect(view.value.a.b.c.d).toBe(view.value.a.b.c.d);
  expect(view.value.a.b.c.d.e).toBe(view.value.a.b.c.d.e);
  expect(view.value.a.b.c.d.e.f).toBe(view.value.a.b.c.d.e.f);

  expect(view.byteLength).toBe(1);
  expect(view.value.a.b.c.d.e.f).toBe(0);
  view.value.a.b.c.d.e.f = 255;
  expect(view.value.a.b.c.d.e.f).toBe(255);
  expect(getBuffer(view).equals(getBuffer(Buffer.from([255])))).toBe(true);
});

test('struct of arrays', () => {
  const schema = struct({ x: array(uint8, 3) });
  const view = createView(schema);

  // Caching
  expect(view.value.x).toBe(view.value.x);
});
