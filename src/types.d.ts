export interface Type {
  tag: string;
  byteLength: number;
  byteAlignment: number;
}

export interface NumberType extends Type {
  kind: string;
  littleEndian: boolean;
}

export interface BooleanType extends Type {
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

export const boolean: BooleanType;
export const bool: BooleanType;

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

export function string(maxLength: number, encoding?: string): StringType;
export function array<T extends Type>(element: T, length: number, options?: { pack?: boolean; }): ArrayType<T>;
export function struct(members: { [name: string]: Type; }, options?: { reorder?: boolean; pack?: boolean | number; }): StructType;
export function tuple(...elements: Type[]): TupleType;
export function bitfield(members: { [name: string]: number; }, element?: NumberType): BitfieldType;
