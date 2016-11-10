import { numberSchemaData, getNumberTagName } from '../_helpers';
import { getBuffer } from '../../utils';
import { createView } from '../../view';

for (const { schema, constructor } of numberSchemaData) {
  test(`view of ${getNumberTagName(schema.numberTag)}`, () => {
    const view = createView(schema);

    expect(typeof view.value).toBe('number');

    expect(view.value).toBe(0);
    expect(getBuffer(view).equals(getBuffer(new constructor([0])))).toBe(true);

    view.value = 42;

    expect(view.value).toBe(42);
    expect(getBuffer(view).equals(getBuffer(new constructor([42])))).toBe(true);
  });
}
