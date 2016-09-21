import test from 'ava';
import { sizeof, alignof } from '../../utils';
import { SchemaTag, string } from '../../schemas';

test('throws on invalid input', t => {
  t.throws(() => (string as any)(), TypeError);
});

test('default args', t => {
  const schema = string(20);

  t.is(schema.tag, SchemaTag.String);
  t.is(sizeof(schema), 20);
  t.is(alignof(schema), 1);
  t.is(schema.encoding, 'utf8');
});

test('ascii', t => {
  const schema = string(10, 'ascii');

  t.is(schema.tag, SchemaTag.String);
  t.is(sizeof(schema), 10);
  t.is(alignof(schema), 1);
  t.is(schema.encoding, 'ascii');
});
