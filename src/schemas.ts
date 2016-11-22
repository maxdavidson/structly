import { align, alignof, sizeof } from './utils';

export const enum SchemaTag {
  Number,
  Bool,
  String,
  Array,
  Tuple,
  Struct,
  Bitfield,
  Buffer
}

export const enum NumberTag {
  Int8,
  UInt8,
  Int16,
  UInt16,
  Int32,
  UInt32,
  Float32,
  Float64
}

export interface SchemaBase<Tag extends SchemaTag> {
  readonly tag: Tag;
  readonly byteLength: number;
  readonly byteAlignment: number;
}

export interface NumberSchema<Tag extends NumberTag> extends SchemaBase<SchemaTag.Number> {
  readonly numberTag: Tag;
  readonly littleEndian?: boolean;
}

export interface BoolSchema extends SchemaBase<SchemaTag.Bool> {
}

export interface StringSchema extends SchemaBase<SchemaTag.String> {
  readonly encoding: 'utf8' | 'ascii';
}

export interface ArraySchema<ElementSchema extends Schema, size extends number> extends SchemaBase<SchemaTag.Array> {
  readonly length: size;
  readonly elementSchema: ElementSchema;
}

export interface TupleSchema extends SchemaBase<SchemaTag.Tuple> {
  readonly fields: {
    readonly byteOffset: number;
    readonly schema: Schema;
  }[];
}

export interface StructSchema extends SchemaBase<SchemaTag.Struct> {
  readonly fields: {
    readonly name: string;
    readonly byteOffset: number;
    readonly schema: Schema;
  }[];
}

export interface BitfieldSchema<Tag extends NumberTag> extends SchemaBase<SchemaTag.Bitfield> {
  readonly elementSchema: NumberSchema<Tag>;
  readonly fields: {
    readonly name: string;
    readonly bits: number;
  }[];
}

export interface BufferSchema extends SchemaBase<SchemaTag.Buffer> {
}

export type Schema =
  NumberSchema<NumberTag>
  | BoolSchema
  | StringSchema
  | ArraySchema<any, number>
  | TupleSchema
  | StructSchema
  | BitfieldSchema<NumberTag>
  | BufferSchema;

function createNumberSchema<Tag extends NumberTag>(
  numberTag: Tag,
  size: number,
  littleEndian?: boolean
): NumberSchema<Tag> {
  return {
    tag: SchemaTag.Number,
    numberTag,
    byteLength: size,
    byteAlignment: size,
    littleEndian
  };
}

/** Bool schema */
export const bool = { tag: SchemaTag.Bool, byteLength: 1, byteAlignment: 1 } as BoolSchema;

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
export function string(maxLength: number, encoding: 'utf8' | 'ascii' = 'utf8'): StringSchema {
  if (typeof maxLength !== 'number') {
    throw new TypeError('You must specify a max length for the string!');
  }

  return {
    tag: SchemaTag.String,
    byteLength: maxLength,
    byteAlignment: 1,
    encoding
  };
}

/** Create an array schema */
export function array<T extends Schema, size extends number>(
  elementSchema: T,
  length: size,
  { pack }: { pack?: boolean | number; } = {}
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
    byteLength: (length as number - 1) * align(sizeof(elementSchema), byteAlignment) + sizeof(elementSchema),
    byteAlignment,
    length,
    elementSchema
  };
}

/** Create a tuple schema */
export function tuple(...elements: Schema[]): TupleSchema {
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
    byteLength: byteOffset,
    byteAlignment:  maxByteAlignment,
    fields
  };
}

/** Create a struct schema */
export function struct(fields: { [fieldName: string]: Schema; }, { reorder = false, pack = 0 } = {}): StructSchema {
  if (typeof fields !== 'object') {
    throw new TypeError('You must specify the struct fields!');
  }

  const fieldNames = Object.keys(fields);
  if (reorder) {
    fieldNames.sort((a, b) => alignof(fields[a]) - alignof(fields[b]));
  }

  let byteOffset = 0;
  let maxByteAlignment = 0;

  const processedFields = fieldNames.map(name => {
    const schema = fields[name];
    const { byteLength, byteAlignment } = schema;
    byteOffset = align(byteOffset, Number(pack || byteAlignment));
    const result = { name , schema, byteOffset };
    byteOffset += byteLength;
    maxByteAlignment = Math.max(maxByteAlignment, byteAlignment);
    return result;
  });

  return {
    tag: SchemaTag.Struct,
    byteLength: byteOffset,
    byteAlignment: Number(pack || maxByteAlignment),
    fields: processedFields
  };
}

/** Create a bitfield schema */
export function bitfield(fields: { [name: string]: number; }): BitfieldSchema<NumberTag.UInt32>;
export function bitfield<Tag extends NumberTag>(
  fields: { [name: string]: number; },
  elementSchema: NumberSchema<Tag>
): BitfieldSchema<Tag>;
export function bitfield(fields, elementSchema = uint32) {
  if (typeof fields !== 'object') {
    throw new TypeError('You must specify the bitfield members!');
  }

  const fieldNames = Object.keys(fields);
  const totalBits = fieldNames.reduce((sum, name) => sum + fields[name], 0);

  if (totalBits > 8 * elementSchema.byteLength) {
    throw new RangeError('Sum of bitfield widths is too large for storage element');
  }

  return {
    tag: SchemaTag.Bitfield,
    byteLength: elementSchema.byteLength,
    byteAlignment: elementSchema.byteAlignment,
    fields: fieldNames.map(name => ({ name, bits: fields[name] })),
    elementSchema
  };
}

/** Create a buffer schema */
export function buffer(length: number): BufferSchema {
  if (typeof length !== 'number') {
    throw new TypeError('You must specify a length of the buffer!');
  }

  return {
    tag: SchemaTag.Buffer,
    byteLength: length,
    byteAlignment: 1
  };
}
