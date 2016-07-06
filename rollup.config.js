/* eslint-disable import/no-extraneous-dependencies */
import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/index.js',
  moduleId: 'structly',
  moduleName: 'Structly',
  sourceMap: true,
  plugins: [
    babel(),
  ],
  targets: [
    { dest: 'dist/structly.js', format: 'umd' },
    { dest: 'dist/structly.mjs', format: 'es' },
  ],
};
