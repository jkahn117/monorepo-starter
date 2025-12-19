import tseslint from "typescript-eslint";
import baseConfig from "./base.js";

/**
 * TypeScript ESLint configuration
 */
export default [
  ...baseConfig,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    name: "@repo/eslint-config/typescript",
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      // Disable base rules that conflict with TypeScript
      "no-unused-vars": "off",
      "no-undef": "off",
      "indent": "off",

      // TypeScript-specific rules with 2-space indentation
      "@typescript-eslint/indent": ["error", 2],
      "@typescript-eslint/comma-dangle": ["error", "always-multiline"],

      // Type safety
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/explicit-function-return-type": [
        "warn",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
        },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/await-thenable": "error",

      // Code style
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
        },
      ],
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/array-type": [
        "error",
        {
          default: "array",
        },
      ],
      "@typescript-eslint/no-unnecessary-type-assertion": "warn",

      // Naming conventions
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "interface",
          format: ["PascalCase"],
        },
        {
          selector: "typeAlias",
          format: ["PascalCase"],
        },
      ],
    },
  },
];
