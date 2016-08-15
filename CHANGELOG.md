# Changelog

## 0.3.2

* Remove usage of `Reflect`
* Fix incorrect TypeScript declaration of `createView`
* Export all TypeScript interfaces

## 0.3.1

* Introduce `Buffer` type
* Add back `Bool` type
* Fix missing string handler for views

## 0.3.0

* Typed views! With `createView`, you can now create objects from your type schemas that automagically update their buffer storage on modification!
* Removed `startOffset` in converter functions. Use an ArrayBufferView (typed array) instead.
* New `createDecoder` and `createEncoder` functions

## 0.2.0

* Code generation! The code for reading and writing to buffers is now created on the fly from the type schemas. This means that all type handlers are inlined, bypassing the need for runtime lookup!
* All built-in type schemas are made immutable using `Object.freeze`
* `Uint64` and `Bool` types have been removed

## 0.1.2

* More build system changes

## 0.1.1

* Minor build system changes

## 0.1.0

* First public release 🎉
