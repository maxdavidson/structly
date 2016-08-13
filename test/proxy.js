import test from 'ava';
import { struct, array, tuple, bitfield, uint8, createProxy } from '../';

test('struct', t => {
  const type = struct({
    x: uint8,
    y: uint8,
    z: uint8,
  });

  const { proxy, buffer } = createProxy(type);

  t.is(proxy.x, 0);
  t.is(proxy.y, 0);
  t.is(proxy.z, 0);

  t.deepEqual(buffer, new Uint8Array([0, 0, 0]));

  proxy.x = 4;
  proxy.y = 2;
  proxy.z = 9;

  t.throws(() => {
    proxy.w = 2;
  });

  t.is(proxy.x, 4);
  t.is(proxy.y, 2);
  t.is(proxy.z, 9);
  t.not('w' in proxy);
  t.is(proxy.w, undefined);

  t.deepEqual(buffer, new Uint8Array([4, 2, 9]));
});

test('array', t => {
  const type = array(uint8, 3);

  const { proxy, buffer } = createProxy(type);

  t.true('length' in proxy);
  t.is(proxy.length, 3);
  t.is(proxy[0], 0);
  t.is(proxy[1], 0);
  t.is(proxy[2], 0);

  t.deepEqual(buffer, new Uint8Array([0, 0, 0]));

  proxy[0] = 4;
  proxy[1] = 2;
  proxy[2] = 9;

  t.throws(() => {
    proxy[3] = 42;
  });

  t.is(proxy[0], 4);
  t.is(proxy[1], 2);
  t.is(proxy[2], 9);
  t.not(3 in proxy);
  t.is(proxy[3], undefined);

  t.deepEqual(buffer, new Float32Array([4, 2, 9]));
});

test('tuple', t => {
  const type = tuple(uint8, uint8, uint8);

  const { proxy, buffer } = createProxy(type);

  t.is(proxy.length, 3);
  t.is(proxy[0], 0);
  t.is(proxy[1], 0);
  t.is(proxy[2], 0);

  t.deepEqual(buffer, new Uint8Array([0, 0, 0]));

  proxy[0] = 4;
  proxy[1] = 2;
  proxy[2] = 9;

  t.is(proxy[0], 4);
  t.is(proxy[1], 2);
  t.is(proxy[2], 9);

  t.deepEqual(buffer, new Uint8Array([4, 2, 9]));
});

test('bitfield', t => {
  const type = bitfield({
    hello: 1,
    there: 7,
    how: 11,
    are: 8,
    you: 5,
  });

  const { proxy, buffer } = createProxy(type);

  t.is(proxy.hello, 0);
  t.is(proxy.there, 0);
  t.is(proxy.how, 0);
  t.is(proxy.are, 0);
  t.is(proxy.you, 0);

  t.deepEqual(buffer, new Uint8Array(new Uint32Array([0]).buffer));

  proxy.hello = 1;
  proxy.there = 2;
  proxy.how = 3;
  proxy.are = 4;
  proxy.you = 5;

  t.is(proxy.hello, 1);
  t.is(proxy.there, 2);
  t.is(proxy.how, 3);
  t.is(proxy.are, 4);
  t.is(proxy.you, 5);

  const expectedValue =
    (1 & 0b1) | ((2 & 0b1111111) << 1) |
    ((3 & 0b11111111111) << (1 + 7)) |
    ((4 & 0b11111111) << (1 + 7 + 11)) |
    ((5 % 0b11111) << (1 + 7 + 11 + 8));

  t.deepEqual(buffer, new Uint8Array(new Uint32Array([expectedValue]).buffer));
});

test('array of structs', t => {
  const type = array(struct({ x: uint8 }), 3);

  const { proxy } = createProxy(type);

  // Caching
  t.is(proxy[0], proxy[0]);
});

test('struct of arrays', t => {
  const type = struct({ x: array(uint8, 3) });

  const { proxy } = createProxy(type);

  // Caching
  t.is(proxy.x, proxy.x);
});
