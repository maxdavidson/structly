export interface Type {
  tag: string;
  byteLength: number;
  byteAlignment: number;
}

export interface NumberType extends Type {
  kind: string;
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
