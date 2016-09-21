import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
  entry: 'js/index.js',
  sourceMap: true,
  plugins: [
    sourcemaps()
  ],
  targets: [
    { dest: 'dist/structly.js', format: 'cjs' },
    { dest: 'dist/structly.es.js', format: 'es' }
  ]
};
