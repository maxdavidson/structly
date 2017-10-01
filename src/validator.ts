import { SCHEMA_VERSION, Schema, SchemaTag } from './schemas';
import { keys } from './utils';

function validate(test: boolean, message: string) {
  return test ? undefined : message;
}

function validateEquality(expected: any, actual: any, propName: string) {
  return validate(actual === expected, `Invalid ${propName}: ${actual}, should be ${expected}`);
}

function validateType(expectedType: string, actual: any) {
  return validateEquality(expectedType, typeof actual, 'type');
}

function validateLength(expected: any, actual: any) {
  return validateEquality(expected.length, actual.length, 'length');
}

// Map keys and ignore undefined values
function mapObject<T, U>(obj: T, mapValue: (value: T[keyof T], key: keyof T) => U): Record<keyof T, U> {
  let newObj: Record<keyof T, U>;
  keys(obj).forEach(key => {
    const value = obj[key];
    const newValue = mapValue(value, key as keyof T);
    if (newValue !== undefined) {
      if (newObj === undefined) {
        newObj = {} as Record<keyof T, U>;
      }
      newObj[key] = newValue;
    }
  });
  return newObj!;
}

export function validateData(schema: Schema, data: any): any {
  if (schema === undefined) {
    throw new TypeError('You must specify a schema to validate with!');
  }

  if (schema.version !== SCHEMA_VERSION) {
    throw new TypeError(`Incompatible schema version (${schema.version})! Expected version ${SCHEMA_VERSION}`);
  }

  switch (schema.tag) {
    case SchemaTag.Number:
      return validateType('number', data);

    case SchemaTag.Bool:
      return validateType('boolean', data);

    case SchemaTag.String:
      return validateType('string', data);

    case SchemaTag.Array:
      return (
        validateType('object', data) ||
        validate(Array.isArray(data), `Data is not an array`) ||
        validateLength(schema, data) ||
        mapObject(data, value => validateData(schema.elementSchema, value))
      );

    case SchemaTag.Tuple:
      return (
        validateType('object', data) ||
        validate(Array.isArray(data), `Data is not an array`) ||
        validateLength(schema.fields, data) ||
        mapObject(schema.fields as any, (field, i) => validateData(field.schema, data[i]))
      );

    case SchemaTag.Struct:
      return (
        validateType('object', data) ||
        mapObject(schema.fields, (field, name) => validateData(field.schema, data[name]))
      );

    case SchemaTag.Bitfield:
      return validateType('object', data) || mapObject(schema.fields, (_, name) => validateType('number', data[name]));

    case SchemaTag.Buffer:
      return (
        validateType('object', data) ||
        validate(Buffer.isBuffer(data), `Data is not a Buffer`) ||
        validateEquality(schema.byteLength, data.byteLength, 'byteLength')
      );

    default:
      throw new TypeError(`Invalid schema tag: ${(schema as Schema).tag}`);
  }
}
