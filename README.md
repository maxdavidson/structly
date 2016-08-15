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
/**
 * Create a decode function for converting a buffer to its JavaScript representation
 */
export function createDecoder<T extends Type>(type: T): Decoder<T>;

/**
 * Create an encode function for serializing a JavaScript object or value into a buffer
 */
export function createEncoder<T extends Type>(type: T): Encoder<T>;

/**
 * Create a converter object that contains both an encoder and a decoder
 */
export function createConverter<T extends Type>(type: T): Converter<T>;

/**
 * Create a view object that automatically updates the buffer on modification
 */
export function createView<T extends Type>(type: T, buffer?: ArrayBuffer | ArrayBufferView): View<T>;

/**
 * Convert a buffer into its JavaScript representation
 * @deprecated
 */
export function decode(type: Type, buffer: ArrayBuffer | ArrayBufferView, data?: any): any;

/**
 * Serialize a JavaScript object or value into a buffer
 * @deprecated
 */
export function encode(type: Type, data: any): ArrayBuffer;
export function encode<T extends ArrayBuffer | ArrayBufferView>(type: Type, data: any, buffer: T): T;


// Type factories:
export function string(maxLength: number, encoding?: string): StringType;
export function array<T extends Type>(element: T, length: number, options?: { pack?: boolean; }): ArrayType<T>;
export function struct(members: { [name: string]: Type; }, options?: { reorder?: boolean; pack?: boolean | number; }): StructType;
export function tuple(...elements: Type[]): TupleType;
export function bitfield(members: { [name: string]: number; }, element?: NumberType): BitfieldType;
export function buffer(length: number): BufferType;


// Type constants:
export const int8: NumberType;
export const uint8: NumberType;

export const int16: NumberType;
export const int16le: NumberType;
export const int16be: NumberType;

export const uint16: NumberType;
export const uint16le: NumberType;
export const uint16be: NumberType;

export const int32: NumberType;
export const int32le: NumberType;
export const int32be: NumberType;

export const uint32: NumberType;
export const uint32le: NumberType;
export const uint32be: NumberType;

export const float32: NumberType;
export const float32le: NumberType;
export const float32be: NumberType;

export const float64: NumberType;
export const float64le: NumberType;
export const float64be: NumberType;


// Utils:
export const systemLittleEndian: boolean;

export function alignof(type?: Type): number;
export function sizeof(type?: Type): number;
export function strideof(type: Type, byteAlignment?: number): number;


// Interfaces:
export interface Decoder<T extends Type> {
  (buffer: ArrayBuffer | ArrayBufferView, data?: any): any;
}

export interface Encoder<T extends Type> {
  (data: any): ArrayBuffer;
  <BufferType extends ArrayBuffer | ArrayBufferView>(data: any, buffer: BufferType): BufferType;
}

export interface Converter<T extends Type> {
  type: T;
  decode: Decoder<T>;
  encode: Encoder<T>;
}

export interface View<T> {
  value: any;
  buffer: ArrayBuffer;
  byteOffset: number;
  byteLength: number;
}

export interface Type {
  tag: string;
  byteLength: number;
  byteAlignment: number;
}

export interface NumberType extends Type {
  kind: string;
  littleEndian: boolean;
}

export interface ArrayType<T extends Type> extends Type {
  length: number;
  element: T;
}

export interface StringType extends Type {
  encoding: string;
}

export interface StructType extends Type {
  members: {
    name: string;
    byteOffset: number;
    element: Type;
  }[];
}

export interface TupleType extends Type {
  members: {
    byteOffset: number;
    element: Type;
  }[];
}

export interface BitfieldType extends Type {
  element: NumberType;
  members: {
    name: string;
    bits: number;
  }[];
}

export interface BufferType extends Type {
}
```
