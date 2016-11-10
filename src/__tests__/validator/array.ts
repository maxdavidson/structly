import { validateData } from '../../validator';
import { array, float32 } from '../../schemas';

const schema = array(float32, 2);

test('invalid', () => {
  expect((validateData as any)(schema)).toBeDefined();
  expect(validateData(schema, 'bajs')).toBeDefined();
  expect(validateData(schema, 12)).toBeDefined();
  expect(validateData(schema, {})).toBeDefined();
  expect(validateData(schema, [])).toBeDefined();
  expect(validateData(schema, [12])).toBeDefined();
});

test('valid', () => {
  expect(validateData(schema, [12, 32])).toBeUndefined();
});
