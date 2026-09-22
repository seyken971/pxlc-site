// @ts-check
// ESLint v9 flat config. Deux surfaces : .astro (pages et composants),
// .ts/.mjs (config, scripts Node). Les overrides pragmatiques sont documentés.
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import eslintPluginAstro from 'eslint-plugin-astro'

export default tseslint.config(
  // Files to ignore — generated output, build artefacts, deps.
  {
    ignores: [
      '.astro/**',
      'node_modules/**',
      'dist/**',
      'public/**',
      '.remember/**',
      '.agents/**',
      '.claude/**',
      'docs/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    // Les scripts Node et les <script> de pages coexistent — on expose les
    // deux jeux de globals plutôt que de maintenir des scopes par dossier.
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],

      // Empty catch blocks are intentional silent-fail (localStorage may
      // throw in Safari private mode). Keep them flagged elsewhere.
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
)
