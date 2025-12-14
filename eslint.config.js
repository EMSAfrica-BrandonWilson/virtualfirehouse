import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules', 'dist', 'coverage', '.vercel', 'build', 'supabase/functions/**', 'supabase/.temp/**', 'public/**']
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node }
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'warn'
    }
  },
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }]
    }
  },
  {
    files: ['**/*.jsx', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    }
  },
  {
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
      'no-empty': 'warn',
      'no-useless-escape': 'warn',
      'no-redeclare': 'warn',
      'no-case-declarations': 'warn',
      'no-fallthrough': 'warn',
      'getter-return': 'warn',
      'no-prototype-builtins': 'warn',
      'no-cond-assign': 'warn',
      'no-dupe-else-if': 'warn',
      'no-useless-catch': 'warn'
    }
  }
];
