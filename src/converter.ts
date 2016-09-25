import { Schema } from './schemas';
import { Decoder, createDecoder, DecoderOptions } from './decoder';
import { Encoder, createEncoder, EncoderOptions } from './encoder';

export interface Converter<T extends Schema> {
  readonly schema: T;

  /** Convert a buffer into its JavaScript representation */
  readonly decode: Decoder<T>;

  /** Serialize a JavaScript object or value into a buffer */
  readonly encode: Encoder<T>;
}

/** Create a converter object that contains both an encoder and a decoder */
export function createConverter<T extends Schema>(schema: T, options?: EncoderOptions & DecoderOptions): Converter<T> {
  return {
    schema,
    encode: createEncoder<T>(schema, options),
    decode: createDecoder<T>(schema, options)
  };
}
