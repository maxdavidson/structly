# Changelog

## 0.5.0

* Export ES2015 modules as separate files, for better tree-shaking
* Reintroduce browser compatibility with included minified UMD bundle

## 0.4.1

* Added the ability too pass options to `createDecoder`, `createEncoder` and `createConverter`

## 0.4.0

* TypeScript conversion! The library has been partially rewritten in TypeScript 2.0, for better tooling support and to prevent managing separate declaration files.
* Rewritten tests
* "Types" are now called "schemas"
* Schema objects are not compatible with 0.3.x
* Input data validation
* Dropped separate `decode` and `encode` functions. Create your converter functions using `createDecoder`, `createEncoder` or `createConverter` instead.
* `DataView` have been replaced by `Buffer`, for better performance in Node. For browser support, a `Buffer` shim must be installed globally. Browserify and Webpack should include this for you by default.

## 0.3.3

* Fix bug in `buffer` code generation
* Better compatibility with older browsers
* Minor performance improvements

## 0.3.2

* Remove usage of `Reflect`
* Fix incorrect TypeScript declaration of `createView`
* Export all TypeScript interfaces

## 0.3.1

* Introduce `buffer` type
* Add back `bool` type
* Fix missing string handler for views

## 0.3.0

* Typed views! With `createView`, you can now create objects from your type schemas that automagically update their buffer storage on modification!
* Removed `startOffset` in converter functions. Use an ArrayBufferView (typed array) instead.
* New `createDecoder` and `createEncoder` functions

## 0.2.0

* Code generation! The code for reading and writing to buffers is now created on the fly from the type schemas. This means that all type handlers are inlined, bypassing the need for runtime lookup!
* All built-in type schemas are made immutable using `Object.freeze`
* `uint64` and `bool` types have been removed

## 0.1.2

* More build system changes

## 0.1.1

* Minor build system changes

## 0.1.0

* First public release 🎉
