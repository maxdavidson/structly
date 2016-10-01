import { createDecoder } from '../../decoder';
import { tuple, float32le, uint16le } from '../../schemas';

const schema = tuple(float32le, uint16le);
const values = [1.5, 2];

const buffer = Buffer.alloc(schema.byteLength);
buffer.writeFloatLE(1.5, 0);
buffer.writeUInt16LE(2, 4);

const decode = createDecoder(schema);

test('tuple', () => {
  const decoded = decode(buffer);
  expect(decoded).toEqual(values);
});

test('invalid schema', () => {
  const invalidSchema = { tag: 999 };
  expect(() => createDecoder(invalidSchema as any)).toThrowError(TypeError);
});

test('resuse object', () => {
  const result = [];
  const decoded = decode(buffer, result);
  expect(decoded).toEqual(values);
  expect(decoded).toBe(result);
});
