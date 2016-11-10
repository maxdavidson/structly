import { validateData } from '../../validator';

test('invalid', () => {
  expect(() => (validateData as any)()).toThrow();
  expect(() => (validateData as any)({ tag: -1 })).toThrow();
});
