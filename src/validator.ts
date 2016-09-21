import { Schema, SchemaTag } from './schemas';

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
function mapObject<T>(
  obj: any,
  mapValue: (value: any, key: string) => any,
  mapKey?: (value: any, key: string) => any
): Object | undefined {
  let newObj;
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    const newValue = mapValue(value, key);
    if (newValue !== undefined) {
      if (newObj === undefined) {
        newObj = {};
      }
      if (mapKey !== undefined) {
        key = mapKey(value, key);
      }
      newObj[key] = newValue;
    }
  });
  return newObj;
}

export function validateData(schema: Schema, data: any) {
  if (schema === undefined) {
    throw new TypeError('You must specify a schema to validate with!');
  }

  switch (schema.tag) {
    case SchemaTag.Number:
      return validateType('number', data);

    case SchemaTag.Bool:
      return validateType('boolean', data);

    case SchemaTag.String:
      return validateType('string', data);

    case SchemaTag.Array:
      return validateType('object', data)
        || validate(Array.isArray(data), `Data is not an array`)
        || validateLength(schema, data)
        || mapObject(data, value => validateData(schema.elementSchema, value));

    case SchemaTag.Tuple:
      return validateType('object', data)
        || validate(Array.isArray(data), `Data is not an array`)
        || validateLength(schema.fields, data)
        || mapObject(schema.fields, (field, i) => validateData(field.schema, data[i]));

    case SchemaTag.Struct:
      return validateType('object', data)
        || mapObject(schema.fields, field => validateData(field.schema, data[field.name]), field => field.name);

    case SchemaTag.Bitfield:
      return validateType('object', data)
        || mapObject(schema.fields, field => validateType('number', data[field.name]));

    case SchemaTag.Buffer:
      return validateType('object', data)
        || validate(Buffer.isBuffer(data), `Data is not a Buffer`)
        || validateEquality(schema.byteLength, data.byteLength, 'byteLength');

    default:
      throw new TypeError(`Invalid schema tag: ${(schema as Schema).tag}`);
  }
}
