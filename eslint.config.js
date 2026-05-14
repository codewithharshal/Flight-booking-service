import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['**/*.{js,mjs,cjs}'],

    ...js.configs.recommended,

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module', // or 'commonjs' if not using ESM
      globals: {
        ...globals.node,
      },
    },
  },
]);
