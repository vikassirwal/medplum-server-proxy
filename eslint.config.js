import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        console: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // Indentation - 2 spaces
      'indent': ['error', 2],
      
      // Quotes
      'quotes': ['error', 'single'],
      
      // Semicolons
      'semi': ['error', 'always'],
      
      // Trailing commas
      'comma-dangle': ['error', 'always-multiline'],
      
      // No unused variables
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
      
      // No console (warn instead of error for development)
      'no-console': 'warn',
      
      // Prefer const
      'prefer-const': 'error',
      
      // No var
      'no-var': 'error',
      
      // TypeScript specific rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      
      // Import/Export rules
      'no-duplicate-imports': 'error',
      
      // Object and array formatting
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      
      // Function spacing
      'space-before-function-paren': ['error', {
        'anonymous': 'always',
        'named': 'never',
        'asyncArrow': 'always'
      }],
      
      // Arrow functions
      'arrow-spacing': 'error',
      'arrow-parens': ['error', 'as-needed'],
      
      // Line length
      'max-len': ['warn', { 'code': 120, 'ignoreUrls': true }],
      
      // Newline at end of file
      'eol-last': 'error',
      
      // No trailing spaces
      'no-trailing-spaces': 'error',
    },
  },
  {
    ignores: ['dist/', 'node_modules/', 'eslint.config.js'],
  },
];
