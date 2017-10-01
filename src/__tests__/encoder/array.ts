import { numberSchemaData } from '../_helpers';
import { getBuffer } from '../../utils';
import { createEncoder } from '../../encoder';
import { array } from '../../schemas';

for (const { schema, constructor } of numberSchemaData) {
  test(`array of ${schema.numberTag}`, () => {
    const values = [1, 2, 3, 4, 5];

    const arraySchema = array(schema, values.length);
    const encode = createEncoder(arraySchema);

    const expected = getBuffer(new constructor(values));
    const encoded = encode(values);

    expect(encoded.equals(expected)).toBe(true);
  });
}
