import test from 'ava';
import { numberSchemaData, getNumberTagName } from '../_helpers';
import { getBuffer } from '../../utils';
import { createView } from '../../view';

for (const { schema, constructor } of numberSchemaData) {
  test(`view of ${getNumberTagName(schema.numberTag)}`, t => {
    const view = createView(schema);

    t.is(typeof view.value, 'number');

    t.is(view.value, 0);
    t.true(getBuffer(view).equals(getBuffer(new constructor([0]))));

    view.value = 42;

    t.is(view.value, 42);
    t.true(getBuffer(view).equals(getBuffer(new constructor([42]))));
  });
}
