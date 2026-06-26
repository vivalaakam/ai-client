import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';
import oneReactComponentPerFile from './eslint-rules/one-react-component-per-file.js';

export default tseslint.config(
  { ignores: ['dist', 'src-tauri'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'local-react': {
        rules: {
          'one-component-per-file': oneReactComponentPerFile,
        },
      },
      'react-hooks': reactHooks,
    },
    rules: {
      // Classic hooks rules only — skip new strict v7 rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      complexity: ['error', 25],
      'local-react/one-component-per-file': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  }
);
