import { align, alignof, sizeof, keys, log2, Mutable, PartialMutable } from './utils';

export const SCHEMA_VERSION = 7;

export const enum SchemaTag {
  Number = 'Number',
  Bool = 'Bool',
  String = 'String',
  Array = 'Array',
  Struct = 'Struct',
  Bitfield = 'Bitfield',
  Tuple = 'Tuple',
  Buffer = 'Buffer',
}

export const enum NumberTag {
  Int8 = 'Int8',
  UInt8 = 'UInt8',
  Int16 = 'Int16',
  UInt16 = 'UInt16',
  Int32 = 'Int32',
  UInt32 = 'UInt32',
  Float32 = 'Float32',
  Float64 = 'Float64',
}

export interface SchemaMap {
  Number: NumberSchema<any, any>;
  Bool: BoolSchema;
  String: StringSchema<any, any>;
  Array: ArraySchema<any, any>;
  Struct: StructSchema<any>;
  Bitfield: BitfieldSchema<any, any>;
  Tuple: TupleSchema<any>;
  Buffer: BufferSchema<any, any>;
}

export const numberByteSize = {
  Int8: 1 as 1,
  UInt8: 1 as 1,
  Int16: 2 as 2,
  UInt16: 2 as 2,
  Int32: 4 as 4,
  UInt32: 4 as 4,
  Float32: 4 as 4,
  Float64: 8 as 8,
};

export type Schema = SchemaMap[keyof SchemaMap];

export interface SchemaBase<Tag extends SchemaTag> {
  readonly tag: Tag;
  readonly version: typeof SCHEMA_VERSION;
  readonly byteLength: number;
  readonly byteAlignment: number;
}

export interface NumberSchema<Tag extends NumberTag, LittleEndian extends boolean>
  extends SchemaBase<SchemaTag.Number> {
  readonly byteLength: typeof numberByteSize[Tag];
  readonly byteAlignment: typeof numberByteSize[Tag];
  readonly numberTag: Tag;
  readonly littleEndian?: LittleEndian;
}

export interface BoolSchema extends SchemaBase<SchemaTag.Bool> {}

export type StringEncoding = 'utf8' | 'ascii';

export interface StringSchema<MaxLength extends number, Encoding extends StringEncoding>
  extends SchemaBase<SchemaTag.String> {
  readonly byteAlignment: 1;
  readonly encoding: Encoding;
}

export interface ArraySchema<ElementSchema extends Schema, Length extends number> extends SchemaBase<SchemaTag.Array> {
  readonly length: Length;
  readonly elementSchema: ElementSchema;
}

export type StructFields = Record<string, Schema>;

export interface StructSchema<Fields extends StructFields> extends SchemaBase<SchemaTag.Struct> {
  readonly fields: {
    readonly [Field in keyof Fields]: {
      readonly byteOffset: number;
      readonly schema: Fields[Field];
    }
  };
}

export type BitfieldFields = Record<string, number>;

export interface BitfieldSchema<Fields extends BitfieldFields, ElementSchema extends NumberSchema<any, any>>
  extends SchemaBase<SchemaTag.Bitfield> {
  readonly byteLength: ElementSchema['byteLength'];
  readonly byteAlignment: ElementSchema['byteAlignment'];
  readonly fields: Fields;
  readonly elementSchema: ElementSchema;
}

export interface TupleSchema<FieldSchema extends Schema> extends SchemaBase<SchemaTag.Tuple> {
  readonly fields: {
    readonly byteOffset: number;
    readonly schema: FieldSchema;
  }[];
}

export interface BufferSchema<Length extends number, Alignment extends number> extends SchemaBase<SchemaTag.Buffer> {
  readonly byteLength: Length;
  readonly byteAlignment: Alignment;
}

// Get a type property or default to never
export type _Get<T extends any, K extends string> = (T & { [n: string]: never })[K];

export type _GetArr<T extends any[], K extends number = number> = T[K];

export type RuntimeType<T extends Schema> = {
  Number: number;
  Bool: boolean;
  String: string;
  Array: Array<RuntimeType<_Get<T, 'elementSchema'>>>;
  Struct: Mutable<{ [Field in keyof _Get<T, 'fields'>]: RuntimeType<_Get<_Get<_Get<T, 'fields'>, Field>, 'schema'>> }>;
  Bitfield: { [Field in keyof _Get<T, 'fields'>]: RuntimeType<_Get<T, 'elementSchema'>> };
  Tuple: Array<RuntimeType<_Get<_GetArr<_Get<T, 'fields'>>, 'schema'>>>;
  Buffer: Buffer;
}[T['tag']];

export type ReadonlyRuntimeType<T extends Schema> = {
  Number: number;
  Bool: boolean;
  String: string;
  Array: ReadonlyArray<ReadonlyRuntimeType<_Get<T, 'elementSchema'>>>;
  Struct: {
    readonly [Field in keyof _Get<T, 'fields'>]: ReadonlyRuntimeType<_Get<_Get<_Get<T, 'fields'>, Field>, 'schema'>>
  };
  Bitfield: { readonly [Field in keyof _Get<T, 'fields'>]: ReadonlyRuntimeType<_Get<T, 'elementSchema'>> };
  Tuple: ReadonlyArray<ReadonlyRuntimeType<_Get<_GetArr<_Get<T, 'fields'>>, 'schema'>>>;
  Buffer: Buffer;
}[T['tag']];

export type PartialRuntimeType<T extends Schema> = {
  Number: number;
  Bool: boolean;
  String: string;
  Array: Array<PartialRuntimeType<_Get<T, 'elementSchema'>>>;
  Struct: PartialMutable<
    { [Field in keyof _Get<T, 'fields'>]: PartialRuntimeType<_Get<_Get<_Get<T, 'fields'>, Field>, 'schema'>> }
  >;
  Bitfield: Mutable<{ [Field in keyof _Get<T, 'fields'>]?: PartialRuntimeType<_Get<T, 'elementSchema'>> }>;
  Tuple: Array<PartialRuntimeType<_Get<_GetArr<_Get<T, 'fields'>>, 'schema'>>>;
  Buffer: Buffer | undefined;
}[T['tag']];

function createNumberSchema<Tag extends NumberTag, LittleEndian extends boolean>(
  numberTag: Tag,
  size: typeof numberByteSize[Tag],
  littleEndian?: LittleEndian,
): NumberSchema<Tag, LittleEndian> {
  return {
    tag: SchemaTag.Number,
    version: SCHEMA_VERSION,
    numberTag,
    byteLength: size,
    byteAlignment: size,
    littleEndian,
  };
}

/** Bool schema */
export const bool: BoolSchema = {
  tag: SchemaTag.Bool,
  version: SCHEMA_VERSION,
  byteLength: 1,
  byteAlignment: 1,
};

/** Int8 schema */
export const int8 = createNumberSchema(NumberTag.Int8, 1);

/** UInt8 schema */
export const uint8 = createNumberSchema(NumberTag.UInt8, 1);

/** Int16 schema */
export const int16 = createNumberSchema(NumberTag.Int16, 2);

/** Int16 schema, little endian */
export const int16le = createNumberSchema(NumberTag.Int16, 2, true);

/** Int16 schema, big endian */
export const int16be = createNumberSchema(NumberTag.Int16, 2, false);

/** UInt16 schema */
export const uint16 = createNumberSchema(NumberTag.UInt16, 2);

/** UInt16 schema, little endian */
export const uint16le = createNumberSchema(NumberTag.UInt16, 2, true);

/** UInt16 schema, big endian */
export const uint16be = createNumberSchema(NumberTag.UInt16, 2, false);

/** Int32 schema */
export const int32 = createNumberSchema(NumberTag.Int32, 4);

/** Int32 schema, little endian */
export const int32le = createNumberSchema(NumberTag.Int32, 4, true);

/** Int32 schema, big endian */
export const int32be = createNumberSchema(NumberTag.Int32, 4, false);

/** UInt32 schema */
export const uint32 = createNumberSchema(NumberTag.UInt32, 4);

/** UInt32 schema, little endian */
export const uint32le = createNumberSchema(NumberTag.UInt32, 4, true);

/** UInt32 schema, big endian */
export const uint32be = createNumberSchema(NumberTag.UInt32, 4, false);

/** Float32 schema */
export const float32 = createNumberSchema(NumberTag.Float32, 4);

/** Float32 schema, little endian */
export const float32le = createNumberSchema(NumberTag.Float32, 4, true);

/** Float32 schema, big endian */
export const float32be = createNumberSchema(NumberTag.Float32, 4, false);

/** Float64 schema */
export const float64 = createNumberSchema(NumberTag.Float64, 8);

/** Float64 schema, little endian */
export const float64le = createNumberSchema(NumberTag.Float64, 8, true);

/** Float64 schema, big endian */
export const float64be = createNumberSchema(NumberTag.Float64, 8, false);

/** Create a string schema */
export function string<MaxLength extends number, Encoding extends StringEncoding = 'utf8'>(
  maxLength: MaxLength,
  encoding: Encoding = 'utf8' as Encoding,
): StringSchema<MaxLength, Encoding> {
  if (typeof maxLength !== 'number') {
    throw new TypeError('You must specify a max length for the string!');
  }

  return {
    tag: SchemaTag.String,
    version: SCHEMA_VERSION,
    byteLength: maxLength,
    byteAlignment: 1,
    encoding,
  };
}

/** Create an array schema */
export function array<T extends Schema, size extends number>(
  elementSchema: T,
  length: size,
  { pack }: { pack?: boolean | number } = {},
): ArraySchema<T, size> {
  if (typeof elementSchema !== 'object') {
    throw new TypeError('You must specify the array element type!');
  }
  if (typeof length !== 'number') {
    throw new TypeError('You must specify a length of the array!');
  }

  const byteAlignment = Number(pack || elementSchema.byteAlignment);

  return {
    tag: SchemaTag.Array,
    version: SCHEMA_VERSION,
    byteLength: ((length as number) - 1) * align(sizeof(elementSchema), byteAlignment) + sizeof(elementSchema),
    byteAlignment,
    length,
    elementSchema,
  };
}

/** Create a tuple schema */
export function tuple<ElementSchema extends Schema>(elements: ElementSchema[]): TupleSchema<ElementSchema> {
  let byteOffset = 0;
  let maxByteAlignment = 0;

  const fields = elements.map(schema => {
    const { byteLength, byteAlignment } = schema;
    byteOffset = align(byteOffset, byteAlignment);
    const result = { byteOffset, schema };
    byteOffset += byteLength;
    maxByteAlignment = Math.max(maxByteAlignment, byteAlignment);
    return result;
  });

  return {
    tag: SchemaTag.Tuple,
    version: SCHEMA_VERSION,
    byteLength: byteOffset,
    byteAlignment: maxByteAlignment,
    fields,
  };
}

/** Create a struct schema */
export function struct<Fields extends StructFields>(
  descriptor: Fields,
  { reorder = false, pack = 0 } = {},
): StructSchema<Fields> {
  if (typeof descriptor !== 'object') {
    throw new TypeError('You must supply a struct descriptor!');
  }

  const fieldNames = keys(descriptor) as (keyof Fields)[];
  if (reorder) {
    fieldNames.sort((a, b) => alignof(descriptor[a] as any) - alignof(descriptor[b] as any));
  }

  let byteOffset = 0;
  let maxByteAlignment = 0;

  const processedFields = fieldNames.reduce(
    (obj, name) => {
      const schema: Schema = descriptor[name];
      const { byteLength, byteAlignment } = schema;
      byteOffset = align(byteOffset, Number(pack || byteAlignment));
      obj[name] = { schema, byteOffset };
      byteOffset += byteLength;
      maxByteAlignment = Math.max(maxByteAlignment, byteAlignment);
      return obj;
    },
    {} as any,
  );

  return {
    tag: SchemaTag.Struct,
    version: SCHEMA_VERSION,
    byteLength: byteOffset,
    byteAlignment: Number(pack || maxByteAlignment),
    fields: processedFields,
  };
}

/** Create a bitfield schema */

export function bitfield<
  Fields extends BitfieldFields,
  ElementSchema extends NumberSchema<NumberTag, boolean> = typeof uint32
>(fields: Fields, elementSchema: ElementSchema = uint32 as ElementSchema): BitfieldSchema<Fields, ElementSchema> {
  if (typeof fields !== 'object') {
    throw new TypeError('You must supply a bitfield descriptor!');
  }

  const fieldNames = keys(fields);
  const totalBits = fieldNames.reduce((sum, name) => sum + fields[name], 0);

  if (totalBits > 8 * elementSchema.byteLength) {
    throw new RangeError('Sum of bitfield widths is too large for storage element');
  }

  return {
    tag: SchemaTag.Bitfield,
    version: SCHEMA_VERSION,
    byteLength: elementSchema.byteLength,
    byteAlignment: elementSchema.byteAlignment,
    fields,
    elementSchema,
  };
}

/** Create a buffer schema */
export function buffer<Length extends number, Alignment extends number = 1>(
  byteLength: Length,
  byteAlignment: Alignment = 1 as Alignment,
): BufferSchema<Length, Alignment> {
  if (typeof byteLength !== 'number') {
    throw new TypeError('You must specify a length of the buffer!');
  }

  if (byteAlignment <= 0) {
    throw new RangeError('Alignment must be positive integer');
  }

  if (log2(byteAlignment) % 1 !== 0) {
    throw new RangeError('Alignment must be a power of 2');
  }

  return {
    tag: SchemaTag.Buffer,
    version: SCHEMA_VERSION,
    byteLength,
    byteAlignment,
  };
}
