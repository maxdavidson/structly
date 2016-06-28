import { Type } from './interfaces';

export function decode(schema: Type, buffer: ArrayBuffer | ArrayBufferView, data?: any, startOffset?: number): any;
export function encode(schema: Type, data: any): ArrayBuffer;
export function encode<T extends ArrayBuffer | ArrayBufferView>(schema: Type, data: any, buffer: T, startOffset?: number): T;
