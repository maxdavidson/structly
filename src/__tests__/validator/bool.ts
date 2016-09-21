import test from 'ava';
import { validateData } from '../../validator';
import { bool } from '../../schemas';

test(`invalid`, t => {
  t.not((validateData as any)(bool), undefined);
  t.not(validateData(bool, 'bajs'), undefined);
  t.not(validateData(bool, 12), undefined);
  t.not(validateData(bool, {}), undefined);
});

test(`valid`, t => {
  t.is(validateData(bool, true), undefined);
  t.is(validateData(bool, false), undefined);
});
