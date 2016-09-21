import test from 'ava';
import { SchemaTag, bool } from '../../schemas';

test('bool', t => {
  t.deepEqual(bool, {
    tag: SchemaTag.Bool,
    byteLength: 1,
    byteAlignment: 1
  });
});
