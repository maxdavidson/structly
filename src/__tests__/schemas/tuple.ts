import test from 'ava';
import { sizeof, strideof, alignof } from '../../utils';
import { SchemaTag, tuple, float32, uint16 } from '../../schemas';

test('tuple', t => {
  const schema = tuple(float32, uint16);

  t.is(schema.tag, SchemaTag.Tuple);
  t.is(sizeof(schema), 6);
  t.is(alignof(schema), 4);
  t.is(strideof(schema), 8);

  t.deepEqual(schema.fields, [
    { schema: float32, byteOffset: 0 },
    { schema: uint16, byteOffset: 4 }
  ]);
});
