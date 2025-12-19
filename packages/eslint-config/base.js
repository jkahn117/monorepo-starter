import js from "@eslint/js";

/**
 * Base JavaScript ESLint configuration
 */
export default [
  js.configs.recommended,
  {
    name: "@repo/eslint-config/base",
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: "warn",
    },
    rules: {
      // Enforce 2-space indentation (constitution requirement)
      "indent": [
        "error",
        2,
        {
          SwitchCase: 1,
          VariableDeclarator: 1,
          outerIIFEBody: 1,
          MemberExpression: 1,
          FunctionDeclaration: { parameters: 1, body: 1 },
          FunctionExpression: { parameters: 1, body: 1 },
          CallExpression: { arguments: 1 },
          ArrayExpression: 1,
          ObjectExpression: 1,
          ImportDeclaration: 1,
          flatTernaryExpressions: false,
          ignoreComments: false,
        },
      ],

      // Trailing commas (constitution requirement)
      "comma-dangle": ["error", "always-multiline"],

      // Code quality
      "no-console": "warn",
      "no-debugger": "error",
      "no-alert": "error",
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      // Best practices
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "no-eval": "error",
      "no-implied-eval": "error",
      "prefer-const": "error",
      "no-var": "error",
    },
  },
];
