import sourcemaps from 'rollup-plugin-sourcemaps';
import nodeResolve from 'rollup-plugin-node-resolve';
import nodeGlobals from 'rollup-plugin-node-globals';
import nodeBuiltins from 'rollup-plugin-node-builtins';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';

export default {
  name: 'Structly',
  amd: {
    id: 'structly',
  },
  input: 'es/index.js',
  output: {
    file: 'dist/structly.js',
    format: 'umd',
  },
  sourcemap: true,
  plugins: [
    sourcemaps(),
    nodeResolve(),
    nodeGlobals(),
    nodeBuiltins(),
    commonjs(),
    uglify()
  ]
};
