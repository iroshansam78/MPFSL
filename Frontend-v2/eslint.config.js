import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    // Config files and build scripts run in Node, not the browser
    files: ['*.config.js', 'scripts/**/*.js'],
    languageOptions: { globals: globals.node },
  },
  {
    // Entry files only pick or render the app; they have no components to hot-reload.
    files: ['src/main.jsx', 'src/entry-server.jsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // three.js objects (vectors, textures, buffers) are meant to be mutated every frame inside useFrame;
    // the React Compiler immutability rule doesn't know that, so it's off for the 3D scene only.
    files: ['src/scene/**/*.{js,jsx}'],
    rules: {
      'react-hooks/immutability': 'off',
    },
  },
])
