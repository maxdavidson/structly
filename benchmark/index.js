'use strict';
const Benchmark = require('benchmark');
const SchemaPack = require('schemapack');
const Structly033 = require('structly');
const Structly = require('..');

// SchemaPack schema
const schemapackSchema = SchemaPack.build({
  health: 'uint32',
  jumping: 'boolean',
  position: ['int16'],
  attributes: {
    str: 'uint8',
    agi: 'uint8',
    int: 'uint8'
  }
}, false);

// Structly 0.3.3 converter
const structly033Converter = (() => {
  const { createConverter, struct, array, bool, uint8, int16, uint32 } = Structly033;

  const schema = struct({
    health: uint32,
    jumping: bool,
    position: array(int16, 3),
    attributes: struct({
      str: uint8,
      agi: uint8,
      int: uint8
    })
  });

  return createConverter(schema);
})();

// Structly (current) converter
const structlyConverter = (() => {
  const { createConverter, struct, array, bool, uint8, int16, uint32 } = Structly;

  const schema = struct({
    health: uint32,
    jumping: bool,
    position: array(int16, 3),
    attributes: struct({
      str: uint8,
      agi: uint8,
      int: uint8
    })
  });

  return createConverter(schema, { unsafe: true, validate: false });
})();

// Object to encode
const player = {
  health: 4000,
  jumping: false,
  position: [-540, 343, 1201],
  attributes: { str: 87, agi: 42, int: 22 },
};

// For JSON decoding
const playerString = JSON.stringify(player);

// For SchemaPack decoding
const schemapackBuffer = schemapackSchema.encode(player);

// For Structly (0.3.3) encoding
const structly033ArrayBuffer = structly033Converter.encode(player);
const structly033DataView = new DataView(structly033ArrayBuffer);

// For Structly (current) encoding
const structlyBuffer = structlyConverter.encode(player);
const structlyArrayBuffer = structlyBuffer.buffer;

// Decoding suite
new Benchmark.Suite()
  .add('JSON: parse', () => {
    JSON.parse(playerString);
  })
  .add('SchemaPack: decode (Buffer)', () => {
    schemapackSchema.decode(schemapackBuffer);
  })
  .add('Structly (current): decode (Buffer)', () => {
    structlyConverter.decode(structlyBuffer);
  })
  .add('Structly (current): decode (Buffer, same object)', () => {
    structlyConverter.decode(structlyBuffer, player);
  })
  .add('Structly (current): decode (ArrayBuffer)', () => {
    structlyConverter.decode(structlyArrayBuffer);
  })
  .add('Structly (current): decode (ArrayBuffer, same object)', () => {
    structlyConverter.decode(structlyArrayBuffer, player);
  })
  .add('Structly (0.3.3): decode (DataView)', () => {
    structly033Converter.decode(structly033DataView);
  })
  .add('Structly (0.3.3): decode (DataView, same object)', () => {
    structly033Converter.decode(structly033DataView, player);
  })
  .add('Structly (0.3.3): decode (ArrayBuffer)', () => {
    structly033Converter.decode(structly033ArrayBuffer);
  })
  .add('Structly (0.3.3): decode (ArrayBuffer, same object)', () => {
    structly033Converter.decode(structly033ArrayBuffer, player);
  })
  .on('cycle', event => {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();

// Encoding suite
new Benchmark.Suite()
  .add('JSON: stringify', () => {
    JSON.stringify(player);
  })
  .add('SchemaPack: encode', () => {
    schemapackSchema.encode(player);
  })
  .add('Structly (current): encode', () => {
    structlyConverter.encode(player);
  })
  .add('Structly (current): encode (same buffer)', () => {
    structlyConverter.encode(player, structlyBuffer);
  })
  .add('Structly (0.3.3): encode', () => {
    structly033Converter.encode(player);
  })
  .add('Structly (0.3.3): encode (same data view)', () => {
    structly033Converter.encode(player, structly033DataView);
  })
  .on('cycle', event => {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
