import { validateData } from '../../validator';
import { struct, float32 } from '../../schemas';

const schema = struct({ a: float32 });

test('invalid', () => {
  expect((validateData as any)(schema)).toBeDefined();
  expect(validateData(schema, 'bajs')).toBeDefined();
  expect(validateData(schema, 12)).toBeDefined();
  expect(validateData(schema, [])).toBeDefined();
  expect(validateData(schema, {})).toBeDefined();
  expect(validateData(schema, { a: '12' })).toBeDefined();
});

test('valid', () => {
  expect(validateData(schema, { a: 12 })).toBeUndefined();
});
