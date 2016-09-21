import test from 'ava';
import { getNumberTagName } from '../_helpers';
import { validateData } from '../../validator';
import * as schemas from '../../schemas';

const numberSchemas: schemas.NumberSchema<schemas.NumberTag>[] = Object.keys(schemas)
  .map(key => schemas[key])
  .filter(schema => 'numberTag' in schema);

for (const numberSchema of numberSchemas) {
  const schemaName = getNumberTagName(numberSchema.numberTag);

  test(`invalid ${schemaName}`, t => {
    t.not((validateData as any)(numberSchema), undefined);
    t.not(validateData(numberSchema, 'bajs'), undefined);
    t.not(validateData(numberSchema, true), undefined);
    t.not(validateData(numberSchema, {}), undefined);
  });

  test(`valid ${schemaName}`, t => {
    t.is(validateData(numberSchema, 45), undefined);
    t.is(validateData(numberSchema, 19), undefined);
  });
}
