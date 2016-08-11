import test from 'ava';
import { struct, uint8, createProxy } from '../';

test('it works', t => {
  const type = struct({
    x: uint8,
    y: uint8,
    z: uint8,
  });

  const { proxy, buffer } = createProxy(type);

  t.is(proxy.x, 0);
  t.is(proxy.y, 0);
  t.is(proxy.z, 0);

  t.deepEqual(buffer, [0, 0, 0]);

  proxy.x = 4;
  proxy.y = 2;
  proxy.z = 9;

  t.is(proxy.x, 4);
  t.is(proxy.y, 2);
  t.is(proxy.z, 9);

  t.deepEqual(buffer, [4, 2, 9]);
});
