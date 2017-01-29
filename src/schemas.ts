import { align, alignof, sizeof } from './utils';

export const SCHEMA_VERSION = 6;

export const enum SchemaTag {
  Number = 0,
  Bool,
  String,
  Array,
  Tuple,
  Struct,
  Bitfield,
  Buffer
}

export const enum NumberTag {
  Int8 = 0,
  UInt8,
  Int16,
  UInt16,
  Int32,
  UInt32,
  Float32,
  Float64
}

export type BitfieldDescriptor = { [name: string]: number; };
export type StructDescriptor = { [name: string]: Schema; };

export type SchemaBase<Tag extends SchemaTag> = {
  readonly tag: Tag;
  readonly version: typeof SCHEMA_VERSION;
  readonly byteLength: number;
  readonly byteAlignment: number;
};

export type NumberSchema<Tag extends NumberTag> = SchemaBase<SchemaTag.Number> & {
  readonly numberTag: Tag;
  readonly littleEndian?: boolean;
};

export type BoolSchema = SchemaBase<SchemaTag.Bool>;

export type StringSchema = SchemaBase<SchemaTag.String> & {
  readonly encoding: 'utf8' | 'ascii';
};

export type ArraySchema<ElementSchema extends Schema, size extends number> = SchemaBase<SchemaTag.Array> & {
  readonly length: size;
  readonly elementSchema: ElementSchema;
};

export type TupleSchema = SchemaBase<SchemaTag.Tuple> & {
  readonly fields: {
    readonly byteOffset: number;
    readonly schema: Schema;
  }[];
};

export type StructSchema<Descriptor extends StructDescriptor> = SchemaBase<SchemaTag.Struct> & {
  readonly fields: {
    readonly [P in keyof Descriptor]: {
      readonly byteOffset: number;
      readonly schema: Descriptor[P];
    };
  };
};

export type BitfieldSchema<Descriptor extends BitfieldDescriptor, Tag extends NumberTag> = SchemaBase<SchemaTag.Bitfield> & {
  readonly elementSchema: NumberSchema<Tag>;
  readonly fields: Descriptor;
};

export type BufferSchema = SchemaBase<SchemaTag.Buffer>;

export type Schema =
  | NumberSchema<NumberTag>
  | BoolSchema
  | StringSchema
  | ArraySchema<any /*Schema*/, number>
  | TupleSchema
  | StructSchema<StructDescriptor>
  | BitfieldSchema<BitfieldDescriptor, NumberTag>
  | BufferSchema;

function createNumberSchema<Tag extends NumberTag>(
  numberTag: Tag,
  size: number,
  littleEndian?: boolean
): NumberSchema<Tag> {
  return {
    tag: SchemaTag.Number,
    version: SCHEMA_VERSION,
    numberTag,
    byteLength: size,
    byteAlignment: size,
    littleEndian
  };
}

/** Bool schema */
export const bool: BoolSchema = {
  tag: SchemaTag.Bool,
  version: SCHEMA_VERSION,
  byteLength: 1,
  byteAlignment: 1
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
export function string(maxLength: number, encoding: 'utf8' | 'ascii' = 'utf8'): StringSchema {
  if (typeof maxLength !== 'number') {
    throw new TypeError('You must specify a max length for the string!');
  }

  return {
    tag: SchemaTag.String,
    version: SCHEMA_VERSION,
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
    version: SCHEMA_VERSION,
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
    version: SCHEMA_VERSION,
    byteLength: byteOffset,
    byteAlignment: maxByteAlignment,
    fields
  };
}

/** Create a struct schema */
export function struct<Descriptor extends StructDescriptor>(descriptor: Descriptor, { reorder = false, pack = 0 } = {}): StructSchema<Descriptor> {
  if (typeof descriptor !== 'object') {
    throw new TypeError('You must supply a struct descriptor!');
  }

  const fieldNames = Object.keys(descriptor) as (keyof Descriptor)[];
  if (reorder) {
    fieldNames.sort((a, b) => alignof(descriptor[a] as any) - alignof(descriptor[b] as any));
  }

  let byteOffset = 0;
  let maxByteAlignment = 0;

  const processedFields = fieldNames.reduce((obj, name) => {
    const schema: Schema = descriptor[name];
    const { byteLength, byteAlignment } = schema;
    byteOffset = align(byteOffset, Number(pack || byteAlignment));
    obj[name] = { schema, byteOffset };
    byteOffset += byteLength;
    maxByteAlignment = Math.max(maxByteAlignment, byteAlignment);
    return obj;
  }, {} as any);

  return {
    tag: SchemaTag.Struct,
    version: SCHEMA_VERSION,
    byteLength: byteOffset,
    byteAlignment: Number(pack || maxByteAlignment),
    fields: processedFields
  };
}

/** Create a bitfield schema */
export function bitfield<Descriptor extends BitfieldDescriptor>(descriptor: BitfieldDescriptor): BitfieldSchema<Descriptor, NumberTag.UInt32>;
export function bitfield<Descriptor extends BitfieldDescriptor, Tag extends NumberTag>(descriptor: BitfieldDescriptor, elementSchema: NumberSchema<Tag>): BitfieldSchema<Descriptor, Tag>;
export function bitfield(descriptor: BitfieldDescriptor, elementSchema = uint32) {
  if (typeof descriptor !== 'object') {
    throw new TypeError('You must supply a bitfield descriptor!');
  }

  const fieldNames = Object.keys(descriptor);
  const totalBits = fieldNames.reduce((sum, name) => sum + descriptor[name], 0);

  if (totalBits > 8 * elementSchema.byteLength) {
    throw new RangeError('Sum of bitfield widths is too large for storage element');
  }

  return {
    tag: SchemaTag.Bitfield,
    version: SCHEMA_VERSION,
    byteLength: elementSchema.byteLength,
    byteAlignment: elementSchema.byteAlignment,
    fields: descriptor,
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
    version: SCHEMA_VERSION,
    byteLength: length,
    byteAlignment: 1
  };
}
