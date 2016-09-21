import test from 'ava';
import { validateData } from '../../validator';

test(`invalid`, t => {
  t.throws(() => (validateData as any)());
  t.throws(() => (validateData as any)({ tag: -1 }));
});
