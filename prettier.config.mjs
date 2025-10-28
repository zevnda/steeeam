/** @type {import("prettier").Config} */
const config = {
  tabWidth: 2,
  useTabs: false,
  semi: false,
  printWidth: 120,
  singleQuote: true,
  jsxSingleQuote: true,
  trailingComma: 'all',
  arrowParens: 'avoid',
  quoteProps: 'consistent',
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  importOrder: [
    '<TYPES>^(node:)',
    '<TYPES>',
    '<TYPES>^[.]',
    '',
    '^@heroui/react$',
    '^(react/(.*)$)|^(react$)',
    '<THIRD_PARTY_MODULES>',
    '',
    '^@/components/(.*)$',
  ],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderTypeScriptVersion: '5.0.0',
  importOrderCaseSensitive: false,
}

export default config
