import js from '@eslint/js';
import { globalIgnores } from 'eslint/config';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const cleanGlobals = (items = {}) =>
  Object.fromEntries(Object.entries(items).map(([key, value]) => [key.trim(), value]));

export default tseslint.config(
  globalIgnores([
    'client/**',
    'dist/**',
    'dist-lk/**',
    'node_modules/**',
    'server/**',
  ]),
  {
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}', 'vite.config.ts', 'vitest.config.ts'],
    languageOptions: {
      ecmaVersion: 2024,
      globals: {
        ...cleanGlobals(globals.browser),
        ...cleanGlobals(globals.es2024),
      },
    },
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-await-in-loop': 'off',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-case-declarations': 'off',
      'no-empty': 'off',
      'no-useless-catch': 'off',
      'prefer-const': 'off',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/rules-of-hooks': 'off',
    },
  },
  {
    files: ['scripts/**/*.{js,mjs}', '*.js', '*.cjs', '*.mjs'],
    languageOptions: {
      globals: {
        ...cleanGlobals(globals.node),
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['*.config.js', '*.config.cjs', 'ecosystem.config.cjs', 'postcss.config.js', 'tailwind.config.js'],
    languageOptions: {
      globals: {
        ...cleanGlobals(globals.node),
      },
    },
  },
);
