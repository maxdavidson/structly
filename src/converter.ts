import { Schema } from './schemas';
import { Decoder, createDecoder } from './decoder';
import { Encoder, createEncoder } from './encoder';

export interface Converter<T extends Schema> {
  readonly schema: T;

  /** Convert a buffer into its JavaScript representation */
  readonly decode: Decoder<T>;

  /** Serialize a JavaScript object or value into a buffer */
  readonly encode: Encoder<T>;
}

/** Create a converter object that contains both an encoder and a decoder */
export function createConverter<T extends Schema>(schema: T): Converter<T> {
  return {
    schema,
    encode: createEncoder<T>(schema),
    decode: createDecoder<T>(schema)
  };
}
