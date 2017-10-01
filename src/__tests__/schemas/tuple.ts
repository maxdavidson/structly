import { sizeof, strideof, alignof } from '../../utils';
import { SchemaTag, SCHEMA_VERSION, tuple, float32, uint16 } from '../../schemas';

test('tuple', () => {
  const schema = tuple([float32, uint16]);

  expect(schema.tag).toBe(SchemaTag.Tuple);
  expect(schema.version).toBe(SCHEMA_VERSION);
  expect(sizeof(schema)).toBe(6);
  expect(alignof(schema)).toBe(4);
  expect(strideof(schema)).toBe(8);

  expect(schema.fields).toEqual([{ schema: float32, byteOffset: 0 }, { schema: uint16, byteOffset: 4 }]);
});
