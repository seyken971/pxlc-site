// @ts-check
// Flat config ESLint. Deux surfaces : .astro (pages et composants),
// .ts/.mjs (config, scripts Node). Les overrides pragmatiques sont documentés.
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import eslintPluginAstro from 'eslint-plugin-astro'

export default tseslint.config(
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

      // Catch vide = échec silencieux voulu (localStorage peut lever en
      // navigation privée Safari).
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
)
