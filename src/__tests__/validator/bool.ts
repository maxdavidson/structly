import { validateData } from '../../validator';
import { bool } from '../../schemas';

test('invalid', () => {
  expect((validateData as any)(bool)).toBeDefined();
  expect(validateData(bool, 'bajs')).toBeDefined();
  expect(validateData(bool, 12)).toBeDefined();
  expect(validateData(bool, {})).toBeDefined();
});

test('valid', () => {
  expect(validateData(bool, true)).toBeUndefined();
  expect(validateData(bool, false)).toBeUndefined();
});
