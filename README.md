# structly

[![NPM](https://img.shields.io/npm/v/structly.svg)](https://www.npmjs.com/package/structly)
[![Build Status](https://img.shields.io/travis/maxdavidson/structly/master.svg)](https://travis-ci.org/maxdavidson/structly)
[![Coverage Status](https://img.shields.io/coveralls/maxdavidson/structly/master.svg)](https://coveralls.io/github/maxdavidson/structly?branch=master)
[![Dependency Status](https://img.shields.io/david/maxdavidson/structly.svg)](https://david-dm.org/maxdavidson/structly)
[![devDependency Status](https://img.shields.io/david/dev/maxdavidson/structly.svg)](https://david-dm.org/maxdavidson/structly#info=devDependencies)

Structly is a tool for working with binary data types in JavaScript, making
it possible to convert array buffers into JavaScript objects/values, and vice versa.
It works great both in Node (4+) and modern browsers. It currently supports
numbers, arrays, structs, tuples, bitfields and strings.

All numeric types use the endianness of your system by default. To force either
little or big endian, use the provided type constants with the -be or -le suffix.

Structly makes sure all data is [properly aligned](https://en.wikipedia.org/wiki/Data_structure_alignment),
to prevent misaligned accesses.


## Usage

```javascript
import { encode, decode, struct, array, float32 } from 'structly';

// Define a point type with three float32 (single-precision) members.
const point = struct({
  x: float32,
  y: float32,
  z: float32
});

// Define an array of points with length 2
const points = array(point, 2);

// The data to encode
const data = [
  { x: 0, y: 1, z: 2 },
  { x: 3, y: 4, z: 5 }
];

// Encode the data into an array buffer using the points type
const bytes = encode(points, data);

// Decode the data in the array buffer using the points type
const decoded = decode(points, bytes);
```


## API

```typescript
// Converters:
export function decode(schema: Type, buffer: ArrayBuffer | ArrayBufferView, data?: any, startOffset?: number): any;
export function encode(schema: Type, data: any): ArrayBuffer;
export function encode<T extends ArrayBuffer | ArrayBufferView>(schema: Type, data: any, buffer: T, startOffset?: number): T;


// Type factories:
export function string(maxLength: number, encoding?: string): StringType;
export function array<T extends Type>(element: T, length: number, options?: { pack?: boolean; }): ArrayType<T>;
export function struct(members: { [name: string]: Type; }, options?: { reorder?: boolean; pack?: boolean | number; }): StructType;
export function tuple(...elements: Type[]): TupleType;
export function bitfield(members: { [name: string]: number; }, element?: NumberType): BitfieldType;


// Type constants:
export const bool: NumberType;
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

export const uint64: NumberType;
export const uint64le: NumberType;
export const uint64be: NumberType;

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
export interface Type {
  tag: string;
  byteLength: number;
  byteAlignment: number;
}

export interface NumberType extends Type {
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
```
