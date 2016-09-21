import test from 'ava';
import { validateData } from '../../validator';
import { bitfield } from '../../schemas';

const schema = bitfield({
  hello: 1,
  there: 7,
  how: 11,
  are: 8,
  you: 5
});

test(`invalid`, t => {
  t.not((validateData as any)(schema), undefined);
  t.not(validateData(schema, 'bajs'), undefined);
  t.not(validateData(schema, 12), undefined);
  t.not(validateData(schema, []), undefined);
  t.not(validateData(schema, {}), undefined);
  t.not(validateData(schema, { a: 'sdf' }), undefined);
  t.not(validateData(schema, {
    hello: 1,
    there: 2,
    how: 3,
    are: 4
  }), undefined);
  t.not(validateData(schema, {
    hello: 1,
    there: 2,
    how: 3,
    are: 4,
    you: '5'
  }), undefined);
});

test(`valid`, t => {
  t.is(validateData(schema, {
    hello: 1,
    there: 2,
    how: 3,
    are: 4,
    you: 5
  }), undefined);
});
