// import
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
})

const eslintConfig = [
  ...compat.config({
    extends: ['next'],
    rules: {
      'react/no-unescaped-entities': 'off',
      '@next/next/no-page-custom-font': 'off',
      '@typescript-eslint/no-explicit-any': 'off', // Allow 'any' type
      '@typescript-eslint/no-unused-vars': ['warn', { args: 'none' }], // Warn for unused variables but ignore function arguments
      '@next/next/no-img-element': 'off', // Allow <img> usage instead of <Image>
      'react-hooks/exhaustive-deps': 'off', // Disable missing dependencies in useEffect
    },
  }),
]

export default eslintConfig
