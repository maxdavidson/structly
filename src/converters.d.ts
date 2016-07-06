import { Type } from './interfaces';

export function decode(type: Type, buffer: ArrayBuffer | ArrayBufferView, data?: any, startOffset?: number): any;
export function encode(type: Type, data: any): ArrayBuffer;
export function encode<T extends ArrayBuffer | ArrayBufferView>(type: Type, data: any, buffer: T, startOffset?: number): T;
