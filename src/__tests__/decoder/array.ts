import test from 'ava';
import { numberSchemaData, getNumberTagName } from '../_helpers';
import { getBuffer } from '../../utils';
import { createDecoder } from '../../decoder';
import { array } from '../../schemas';

for (const { schema, constructor } of numberSchemaData) {
  test(`array of ${getNumberTagName(schema.numberTag)}`, t => {
    const values = [1, 2, 3, 4, 5];
    const buffer = getBuffer(new constructor(values));

    const length = buffer.byteLength / schema.byteLength;
    const arraySchema = array(schema, length);
    const decode = createDecoder(arraySchema);

    const decoded = decode(buffer);

    t.deepEqual(decoded, values);
  });
}
