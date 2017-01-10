import { SchemaTag, SCHEMA_VERSION, bool } from '../../schemas';

test('bool', () => {
  expect(bool).toEqual({
    tag: SchemaTag.Bool,
    version: SCHEMA_VERSION,
    byteLength: 1,
    byteAlignment: 1
  });
});
