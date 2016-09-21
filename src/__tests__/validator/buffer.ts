import test from 'ava';
import { validateData } from '../../validator';
import { buffer } from '../../schemas';

const schema = buffer(1024);

test(`invalid`, t => {
  t.not((validateData as any)(schema), undefined);
  t.not(validateData(schema, 'bajs'), undefined);
  t.not(validateData(schema, 12), undefined);
  t.not(validateData(schema, {}), undefined);
  t.not(validateData(schema, []), undefined);
});

test(`valid`, t => {
  t.is(validateData(schema, Buffer.allocUnsafe(1024)), undefined);
});
