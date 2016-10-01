import { getBuffer } from '../../utils';
import { createView } from '../../view';
import { array, struct, uint8 } from '../../schemas';

test('short array', () => {
  const schema = array(uint8, 3);
  const view = createView(schema);

  expect('length' in view.value).toBe(true);
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
  expect(3 in view.value).toBe(false);
  expect(view.value[3]).toBe(undefined);

  expect(getBuffer(view).equals(Buffer.from([4, 2, 9]))).toBe(true);
});

test('long array of numbers', () => {
  const schema = array(uint8, 100);
  const view = createView(schema);

  expect(view.value.length).toBe(schema.length);
  for (let i = 0; i < schema.length; ++i) {
    expect(view.value[i]).toBe(0);
  }

  expect(getBuffer(view).equals(Buffer.alloc(schema.length))).toBe(true);

  for (let i = 0; i < schema.length; ++i) {
    view.value[i] = 42;
  }

  for (let i = 0; i < schema.length; ++i) {
    expect(view.value[i]).toBe(42);
  }

  expect(getBuffer(view).equals(Buffer.alloc(schema.length, 42))).toBe(true);
});

test('short array of structs', () => {
  const schema = array(struct({ x: uint8 }), 3);
  const view = createView(schema);

  // Caching
  expect(view.value[0]).toBe(view.value[0]);
});

test('long array of structs', () => {
  const schema = array(struct({ x: uint8 }), 100);
  const view = createView(schema);

  if (typeof Symbol === 'function') {
    const symbol = Symbol();
    expect(symbol in view.value).toBe(false);
    view.value[symbol] = symbol;
    delete view.value[symbol];
  }

  expect(view.value.length).toBe(schema.length);
  expect(-1 in view.value).toBe(false);

  expect(schema.length in view.value).toBe(false);

  for (let i = 0; i < schema.length; ++i) {
    expect(i in view.value).toBe(true);
    expect(view.value[i]).toEqual({ x: 0 });
    // Caching
    expect(view.value[i]).toBe(view.value[i]);
  }

  expect(getBuffer(view).equals(Buffer.alloc(schema.length))).toBe(true);

  for (let i = 0; i < schema.length; ++i) {
    view.value[i] = { x: 42 };
  }

  for (let i = 0; i < schema.length; ++i) {
    expect(view.value[i]).toEqual({ x: 42 });
    // Caching
    expect(view.value[i]).toBe(view.value[i]);
  }

  expect(getBuffer(view).equals(Buffer.alloc(schema.length, 42))).toBe(true);
});
