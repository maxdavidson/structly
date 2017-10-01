import { validateData } from '../../validator';
import { bitfield } from '../../schemas';

const schema = bitfield({
  hello: 1,
  there: 7,
  how: 11,
  are: 8,
  you: 5,
});

test('invalid', () => {
  expect((validateData as any)(schema)).toBeDefined();
  expect(validateData(schema, 'bajs')).toBeDefined();
  expect(validateData(schema, 12)).toBeDefined();
  expect(validateData(schema, [])).toBeDefined();
  expect(validateData(schema, {})).toBeDefined();
  expect(validateData(schema, { a: 'sdf' })).toBeDefined();
  expect(
    validateData(schema, {
      hello: 1,
      there: 2,
      how: 3,
      are: 4,
    }),
  ).toBeDefined();
  expect(
    validateData(schema, {
      hello: 1,
      there: 2,
      how: 3,
      are: 4,
      you: '5',
    }),
  ).toBeDefined();
});

test('valid', () => {
  expect(
    validateData(schema, {
      hello: 1,
      there: 2,
      how: 3,
      are: 4,
      you: 5,
    }),
  ).toBeUndefined();
});
