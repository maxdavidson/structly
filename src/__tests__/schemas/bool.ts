import { SchemaTag, bool } from '../../schemas';

test('bool', () => {
  expect(bool).toEqual({
    tag: SchemaTag.Bool,
    byteLength: 1,
    byteAlignment: 1
  });
});
