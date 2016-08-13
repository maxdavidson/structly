import { Type } from './interfaces';

declare class Converter<T extends Type> {
  constructor(type: T);
  decode(buffer: ArrayBuffer | ArrayBufferView, data?: any, startOffset?: number): any;
  encode(data: any): ArrayBuffer;
  encode<BufferType extends ArrayBuffer | ArrayBufferView>(data: any, buffer: BufferType, startOffset?: number): BufferType;
}

interface View<T> {
  value: any;
  buffer: ArrayBuffer;
  byteOffset: number;
  byteLength: number;
}

export function createConverter<T extends Type>(type: T, options?: { cache?: boolean; }): Converter<T>;
export function createView<T extends Type>(type: T): View<T>;

export function decode(type: Type, buffer: ArrayBuffer | ArrayBufferView, data?: any, startOffset?: number): any;
export function encode(type: Type, data: any): ArrayBuffer;
export function encode<T extends ArrayBuffer | ArrayBufferView>(type: Type, data: any, buffer: T, startOffset?: number): T;
