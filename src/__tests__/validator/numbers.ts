import { getNumberTagName } from '../_helpers';
import { validateData } from '../../validator';
import * as schemas from '../../schemas';

const numberSchemas: schemas.NumberSchema<schemas.NumberTag>[] = Object.keys(schemas)
  .map(key => schemas[key])
  .filter(schema => 'numberTag' in schema);

for (const numberSchema of numberSchemas) {
  const schemaName = getNumberTagName(numberSchema.numberTag);

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
