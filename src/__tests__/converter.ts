import test from 'ava';
import { createConverter } from '../converter';
import { float32 } from '../schemas';

test('invalid', t => {
  t.throws(() => (createConverter as any)());
});

test('default', t => {
  const schema = float32;
  const converter = createConverter(schema);

  t.is(converter.schema, schema);
  t.is(typeof converter.decode, 'function');
  t.is(typeof converter.encode, 'function');
});
