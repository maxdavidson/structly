import test from 'ava';
import { validateData } from '../../validator';
import { array, float32 } from '../../schemas';

const schema = array(float32, 2);

test(`invalid`, t => {
  t.not((validateData as any)(schema), undefined);
  t.not(validateData(schema, 'bajs'), undefined);
  t.not(validateData(schema, 12), undefined);
  t.not(validateData(schema, {}), undefined);
  t.not(validateData(schema, []), undefined);
  t.not(validateData(schema, [12]), undefined);
});

test(`valid`, t => {
  t.is(validateData(schema, [12, 32]), undefined);
});
