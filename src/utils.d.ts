import { Type } from './interfaces';

export const systemLittleEndian: boolean;

export function align(byteOffset: number, byteAlignment: number): number;
export function alignof(type?: Type): number;
export function sizeof(type?: Type): number;
export function strideof(type: Type, byteAlignment?: number): number;
export function createMask(bits: number): number;
export function assign<T>(target: T, ...sources: any[]): T;
export function getDataView(data: ArrayBuffer | ArrayBufferView): DataView;
