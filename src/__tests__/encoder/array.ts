import test from 'ava';
import { numberSchemaData, getNumberTagName } from '../_helpers';
import { getBuffer } from '../../utils';
import { createEncoder } from '../../encoder';
import { array } from '../../schemas';

for (const { schema, constructor } of numberSchemaData) {
  test(`array of ${getNumberTagName(schema.numberTag)}`, t => {
    const values = [1, 2, 3, 4, 5];

    const arraySchema = array(schema, values.length);
    const encode = createEncoder(arraySchema);

    const expected = getBuffer(new constructor(values));
    const encoded = encode(values);

    t.true(encoded.equals(expected));
  });
}
