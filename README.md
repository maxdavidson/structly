# structly

[![NPM](https://img.shields.io/npm/v/structly.svg)](https://www.npmjs.com/package/structly)
[![Build Status](https://img.shields.io/travis/maxdavidson/structly/master.svg)](https://travis-ci.org/maxdavidson/structly)
[![Coverage Status](https://img.shields.io/coveralls/maxdavidson/structly/master.svg)](https://coveralls.io/github/maxdavidson/structly?branch=master)
[![Dependency Status](https://img.shields.io/david/maxdavidson/structly.svg)](https://david-dm.org/maxdavidson/structly)
[![devDependency Status](https://img.shields.io/david/dev/maxdavidson/structly.svg)](https://david-dm.org/maxdavidson/structly?type=dev)

Structly is a tool for working with binary data types in JavaScript.

With Structly, you define your data types using a friendly, functional API.
These data types are then used to generate optimized code for quickly converting
JavaScript objects into their binary representation, and the other way around.
Object instances can even be reused, to avoid excessive object allocations
and minimize garbage collection!

You can also create "view" objects from your type schemas that automatically update
their underlying buffer storage on modification, like magic! This concept is shamelessly inspired
by [Typed Objects](http://wiki.ecmascript.org/doku.php?id=harmony:typed_objects).

Structly works great both in Node (>=4) and most browsers.
It supports numbers, booleans, arrays, structs, tuples, bitfields, strings and buffers.


## Usage

```javascript
import { createConverter, struct, array, float32 } from 'structly';

// A point type with three float32 (single-precision) members.
const point = struct({
  x: float32,
  y: float32,
  z: float32
});

// An array of two points
const points = array(point, 2);

// Prepare some data
const data = [
  { x: 0, y: 1, z: 2 },
  { x: 3, y: 4, z: 5 }
];

// Create a converter for encoding and decoding data
const converter = createConverter(points);

// Encode the JavaScript object into an array buffer
const bytes = converter.encode(data);

// Decode the bytes in the array buffer into a JavaScript object
const decoded = converter.decode(bytes);
```


## Notes

All numeric types use the endianness of your system by default. To force either
little or big endian, use the provided type constants with the -be or -le suffix.

By default, Structly makes sure accesses are [properly aligned](https://en.wikipedia.org/wiki/Data_structure_alignment).
This results in structs being padded with empty space for performance reasons.
You can override the byte alignment of the struct by passing
`{ pack: n }` as a second argument to the `struct` type factory, similar to `#pragma pack(n)`.


## API

```typescript
/** Create an encode function for serializing a JavaScript object or value into a buffer */
export declare function createEncoder<T extends Schema>(schema: T, validate?: boolean): Encoder<T>;

/** Create a decode function for converting a buffer into its JavaScript representation */
export declare function createDecoder<T extends Schema>(schema: T): Decoder<T>;

/** Create a converter object that contains both an encoder and a decoder */
export declare function createConverter<T extends Schema>(schema: T): Converter<T>;

/** Create a view object that automatically updates the buffer on modification */
export declare function createView<T extends Schema>(schema: T, buffer?: Buffer | ArrayBuffer | ArrayBufferView, byteOffset?: number): View<T>;

/** Create a string schema */
export declare function string(maxLength: number, encoding?: 'utf8' | 'ascii'): StringSchema;

/** Create an array schema */
export declare function array<T extends Schema, size extends number>(elementSchema: T, length: size, { pack }?: { pack?: boolean | number; }): ArraySchema<T, size>;

/** Create a tuple schema */
export declare function tuple(...elements: Schema[]): TupleSchema;

/** Create a struct schema */
export declare function struct(fields: { [fieldName: string]: Schema; }, { reorder, pack }?: { reorder?: boolean; pack?: number; }): StructSchema;

/** Create a bitfield schema */
export declare function bitfield(fields: { [name: string]: number; }): BitfieldSchema<NumberTag.UInt32>;
export declare function bitfield<Tag extends NumberTag>(fields: { [name: string]: number; }, elementSchema: NumberSchema<Tag>): BitfieldSchema<Tag>;

/** Create a buffer schema */
export declare function buffer(length: number): BufferSchema;

export declare const bool: BoolSchema;
export declare const int8: NumberSchema<NumberTag.Int8>;
export declare const uint8: NumberSchema<NumberTag.UInt8>;
export declare const int16: NumberSchema<NumberTag.Int16>;
export declare const int16le: NumberSchema<NumberTag.Int16>;
export declare const int16be: NumberSchema<NumberTag.Int16>;
export declare const uint16: NumberSchema<NumberTag.UInt16>;
export declare const uint16le: NumberSchema<NumberTag.UInt16>;
export declare const uint16be: NumberSchema<NumberTag.UInt16>;
export declare const int32: NumberSchema<NumberTag.Int32>;
export declare const int32le: NumberSchema<NumberTag.Int32>;
export declare const int32be: NumberSchema<NumberTag.Int32>;
export declare const uint32: NumberSchema<NumberTag.UInt32>;
export declare const uint32le: NumberSchema<NumberTag.UInt32>;
export declare const uint32be: NumberSchema<NumberTag.UInt32>;
export declare const float32: NumberSchema<NumberTag.Float32>;
export declare const float32le: NumberSchema<NumberTag.Float32>;
export declare const float32be: NumberSchema<NumberTag.Float32>;
export declare const float64: NumberSchema<NumberTag.Float64>;
export declare const float64le: NumberSchema<NumberTag.Float64>;
export declare const float64be: NumberSchema<NumberTag.Float64>;

export declare type Decoder<T extends Schema> = (buffer: BufferLike, result?: any, byteOffset?: number) => any;

export interface Encoder<T extends Schema> {
  (data: any): Buffer;
  <BufferType extends BufferLike>(data: any, buffer: BufferType, byteOffset?: number): BufferType;
}

export interface Converter<T extends Schema> {
  readonly schema: T;
  readonly decode: Decoder<T>;
  readonly encode: Encoder<T>;
}

export interface View<T extends Schema> {
  value: any;
  readonly schema: T;
  readonly buffer: ArrayBuffer;
  readonly byteLength: number;
  readonly byteOffset: number;
}

export declare const enum SchemaTag {
  Number = 0,
  Bool = 1,
  String = 2,
  Array = 3,
  Tuple = 4,
  Struct = 5,
  Bitfield = 6,
  Buffer = 7
}

export declare const enum NumberTag {
  Int8 = 0,
  Int16 = 1,
  Int32 = 2,
  UInt8 = 3,
  UInt16 = 4,
  UInt32 = 5,
  Float32 = 6,
  Float64 = 7
}

export declare type Schema = NumberSchema<NumberTag> | BoolSchema | StringSchema | ArraySchema<any, number> | TupleSchema | StructSchema | BitfieldSchema<NumberTag> | BufferSchema;

export interface SchemaBase<Tag extends SchemaTag> {
  readonly tag: Tag;
  readonly byteLength: number;
  readonly byteAlignment: number;
}

export interface NumberSchema<Tag extends NumberTag> extends SchemaBase<SchemaTag.Number> {
  readonly numberTag: Tag;
  readonly littleEndian?: boolean;
}

export interface BoolSchema extends SchemaBase<SchemaTag.Bool> {}

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
```
