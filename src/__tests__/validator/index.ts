import { validateData } from '../../validator';
import { uint8 } from '../../schemas';

test('invalid', () => {
  expect(() => (validateData as any)()).toThrow();
  expect(() => (validateData as any)({ ...uint8, tag: -1 })).toThrow();
  expect(() => (validateData as any)({ ...uint8, version: -1 })).toThrow();
});
