import { validateData } from '../../validator';
import * as schemas from '../../schemas';
import { entries } from '../../utils';

const numberSchemas: schemas.NumberSchema<schemas.NumberTag>[] = entries(schemas)
  .filter(([_, schema]) => typeof schema === 'object' && schema !== null && 'numberTag' in schema)
  .map(([_, schema]) => schema as any);

for (const numberSchema of numberSchemas) {
  const { numberTag: schemaName } = numberSchema;

  test(`invalid ${schemaName}`, () => {
    expect((validateData as any)(numberSchema)).toBeDefined();
    expect(validateData(numberSchema, 'bajs')).toBeDefined();
    expect(validateData(numberSchema, true)).toBeDefined();
    expect(validateData(numberSchema, {})).toBeDefined();
  });

  test(`valid ${schemaName}`, () => {
    expect(validateData(numberSchema, 45)).toBeUndefined();
    expect(validateData(numberSchema, 19)).toBeUndefined();
  });
}
