import  terser  from "@rollup/plugin-terser";
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import polyfillNode from 'rollup-plugin-polyfill-node';


export default {
  input: 'lib/index.js',
  output: {
    file: 'dist/sdk.min.js',
    format: 'umd',
    name: 'SugarCrmSdk',
    sourcemap: true,
    globals: {
        'axios': 'axios',
        'axios-retry': 'axiosRetry',
        'dotenv': 'dotenv'
      }
  },
  plugins: [polyfillNode(), json(), resolve(), commonjs(), terser()]
};
