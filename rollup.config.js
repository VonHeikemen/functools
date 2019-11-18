import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/functools.js',
      format: 'cjs'
    },
    {
      file: 'dist/functools.esm.js',
      format: 'esm',
      plugins: [terser()]
    },
    {
      file: 'dist/functools.min.js',
      format: 'iife',
      name: 'functools',
      plugins: [terser()]
    }
  ]
};

