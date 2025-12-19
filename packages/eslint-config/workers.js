import typescriptConfig from "./typescript.js";

/**
 * Cloudflare Workers-specific ESLint configuration
 */
export default [
  ...typescriptConfig,
  {
    name: "@repo/eslint-config/workers",
    languageOptions: {
      globals: {
        // Cloudflare Workers runtime globals
        caches: "readonly",
        crypto: "readonly",
        Request: "readonly",
        Response: "readonly",
        Headers: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        fetch: "readonly",
        addEventListener: "readonly",

        // Workers-specific
        WebSocket: "readonly",
        WebSocketPair: "readonly",
        DurableObject: "readonly",
        ScheduledEvent: "readonly",
        ExecutionContext: "readonly",

        // Environment bindings (common patterns)
        Env: "readonly",
      },
    },
    rules: {
      // Workers-specific rules
      "no-restricted-globals": [
        "error",
        {
          name: "window",
          message: "window is not available in Cloudflare Workers",
        },
        {
          name: "document",
          message: "document is not available in Cloudflare Workers",
        },
        {
          name: "localStorage",
          message: "localStorage is not available in Cloudflare Workers",
        },
      ],

      // Workers best practices
      "no-restricted-syntax": [
        "error",
        {
          selector: "NewExpression[callee.name='Date'][arguments.length=0]",
          message:
            "Avoid new Date() without arguments in Workers for consistency",
        },
      ],

      // Async handling
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/promise-function-async": "error",
    },
  },
];
