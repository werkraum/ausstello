import { defineConfig } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import scss from 'rollup-plugin-scss';
import livereload from 'rollup-plugin-livereload';
import path from "node:path";

const isProduction = process.env.NODE_ENV === 'production';

/**
 * use this config to generate requireJS compatible Code
 */
export default defineConfig([
  {
    input: {
      ausstello: "./JavaScript/ausstello.js",
      detail: "./JavaScript/detail.js",
    },
    output: {
      sourcemap: true,
      compact: true,
      format: 'es',
      dir: path.resolve(__dirname, '../Resources/Public/JavaScript'),
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({ babelHelpers: 'bundled' }),
      scss({
        output: path.resolve(__dirname, '../Resources/Public/Css/ausstello.css'),
        sourceMap: true,
      }),
      !isProduction && livereload({
        clientUrl: 'http://localhost:35729/livereload.js?snipver=1',
        watch: '../Resources/Public/**/*',
      })
    ]
  }
]);
