import { validateData } from '../../validator';
import { buffer } from '../../schemas';

const schema = buffer(1024);

test('invalid', () => {
  expect((validateData as any)(schema)).toBeDefined();
  expect(validateData(schema, 'bajs')).toBeDefined();
  expect(validateData(schema, 12)).toBeDefined();
  expect(validateData(schema, {})).toBeDefined();
  expect(validateData(schema, [])).toBeDefined();
});

test('valid', () => {
  expect(validateData(schema, Buffer.allocUnsafe(1024))).toBeUndefined();
});
