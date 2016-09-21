import test from 'ava';
import { SchemaTag, buffer } from '../../schemas';
import { alignof, sizeof } from '../../utils';

test('invalid input', t => {
  t.throws(() => (buffer as any)(), TypeError);
  t.throws(() => (buffer as any)('bajs'), TypeError);
});

test('default behavior', t => {
  const schema = buffer(100);

  t.is(schema.tag, SchemaTag.Buffer);
  t.is(sizeof(schema), 100);
  t.is(alignof(schema), 1);
});
