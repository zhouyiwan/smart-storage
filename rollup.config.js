import pluginNodeResolve from '@rollup/plugin-node-resolve'
import pluginBabel from '@rollup/plugin-babel'
import replace from '@rollup/plugin-replace'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

const env = process.env.NODE_ENV

const extensions = ['.js', '.ts', '.json']

const config = {
  input: 'src/index.ts',
  external: Object.keys(pkg.peerDependencies || {}),
  output: {
    format: 'umd',
    name: 'ReactRedux',
  },
  plugins: [
    pluginNodeResolve({
      extensions,
    }),
    pluginBabel({
      include: 'src/**/*',
      exclude: '**/node_modules/**',
      babelHelpers: 'runtime',
      extensions,
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env),
      preventAssignment: true,
    }),
    commonjs(),
  ],
}

if (env === 'production') {
  config.plugins.push(
    terser({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false,
      },
    })
  )
}

export default config
