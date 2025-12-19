import typescriptConfig from "@repo/eslint-config/typescript";

export default [
  ...typescriptConfig,
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.wrangler/**",
      "**/coverage/**",
      "**/.turbo/**",
    ],
  },
];
