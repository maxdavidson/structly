import test from 'ava';
import { sizeof, strideof, alignof } from '../../utils';
import { SchemaTag, bitfield, uint32, uint8 } from '../../schemas';

test('invalid input', t => {
  t.throws(() => (bitfield as any)(), TypeError);
  t.throws(() => (bitfield as any)('bajs'), TypeError);
  t.throws(() => bitfield({ a: 20, b: 20 }), RangeError);
  t.throws(() => bitfield({ a: 20, b: 20 }, uint8), RangeError);
});

test('default storage', t => {
  const schema = bitfield({
    hello: 1,
    there: 7,
    how: 11,
    are: 8,
    you: 5
  });

  t.is(schema.tag, SchemaTag.Bitfield);
  t.is(schema.elementSchema, uint32);
  t.is(sizeof(schema), sizeof(schema.elementSchema));
  t.is(strideof(schema), strideof(schema.elementSchema));
  t.is(alignof(schema), alignof(schema.elementSchema));
});

test('custom storage', t => {
  const schema = bitfield({
    hello: 1,
    there: 7
  }, uint8);

  t.is(schema.tag, SchemaTag.Bitfield);
  t.is(schema.elementSchema, uint8);
  t.is(sizeof(schema), sizeof(schema.elementSchema));
  t.is(strideof(schema), strideof(schema.elementSchema));
  t.is(alignof(schema), alignof(schema.elementSchema));
});
