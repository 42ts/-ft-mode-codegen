import terser from '@rollup/plugin-terser';
import shebang from 'rollup-plugin-shebang-bin';

export default {
  input: 'compile/bin.js',
  output: {
    dir: 'dist',
    format: 'cjs',
  },
  plugins: [
    terser(),
    shebang(),
  ],
};
