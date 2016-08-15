import { Type } from './types';

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
export function createView<T extends Type>(type: T, buffer: ArrayBuffer | ArrayBufferView): View<T>;

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
