/**
 * Shared Prettier configuration
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  // 2-space indentation (constitution requirement)
  tabWidth: 2,
  useTabs: false,

  // Trailing commas for better git diffs (constitution requirement)
  trailingComma: "all",

  // Code style
  semi: true,
  singleQuote: false,
  quoteProps: "as-needed",

  // Line formatting
  printWidth: 80,
  proseWrap: "preserve",
  endOfLine: "lf",

  // Bracket spacing
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "always",

  // Special file handling
  overrides: [
    {
      files: "*.json",
      options: {
        trailingComma: "none",
      },
    },
    {
      files: "*.md",
      options: {
        proseWrap: "always",
      },
    },
  ],
};

export default config;
