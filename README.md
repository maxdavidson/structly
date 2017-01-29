# structly

[![NPM](https://img.shields.io/npm/v/structly.svg)](https://www.npmjs.com/package/structly)
[![Build Status](https://img.shields.io/travis/maxdavidson/structly/master.svg)](https://travis-ci.org/maxdavidson/structly)
[![Coverage Status](https://img.shields.io/coveralls/maxdavidson/structly/master.svg)](https://coveralls.io/github/maxdavidson/structly?branch=master)
[![Dependency Status](https://img.shields.io/david/maxdavidson/structly.svg)](https://david-dm.org/maxdavidson/structly)
[![devDependency Status](https://img.shields.io/david/dev/maxdavidson/structly.svg)](https://david-dm.org/maxdavidson/structly?type=dev)
[![Greenkeeper badge](https://badges.greenkeeper.io/maxdavidson/structly.svg)](https://greenkeeper.io/)

Structly is a tool for working with binary data types in JavaScript.

With Structly, you define your data types using a friendly, functional API.
These data types are then used to generate optimized code for quickly converting
JavaScript objects into their binary representation, and the other way around.
Object instances can even be reused, to avoid excessive object allocations
and minimize garbage collection!

You can also create "view" objects from your type schemas that automatically update
their underlying buffer storage on modification, like magic! This concept is shamelessly inspired
by [Typed Objects](http://wiki.ecmascript.org/doku.php?id=harmony:typed_objects).

Structly supports numbers, booleans, arrays, structs, tuples, bitfields, strings and buffers.

## Compatiblity

Structly works great in Node (>=4.5.0). A minified UMD build with included shims is also available for browser compatibility. Structly also exposes ES2015 modules for tree-shaking with ES2015-compatible module loaders, such as Rollup or Webpack 2.

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
