import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import tseslint from "typescript-eslint";

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettier,
  // Type-aware rules, scoped to TypeScript so the .mjs configs stay untyped.
  ...tseslint.configs.recommendedTypeChecked.map((c) => ({
    ...c,
    files: ["**/*.{ts,tsx,mts,cts}"],
  })),
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // eslint-plugin-react's version auto-detection calls an API removed in ESLint 10.
    settings: { react: { version: "19.3" } },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Superseded by the no-restricted-syntax rule below: this codebase
      // always imports React as `import * as React from "react"`, even in
      // files that only reference React's types (e.g. `React.ReactNode`),
      // which this rule would otherwise force into `import type * as React`.
      "@typescript-eslint/consistent-type-imports": "off",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      // Under verbatimModuleSyntax, `import { type X }` still loads the
      // module at runtime (it pulled zod into client bundles); only
      // `import type { X }` is erased.
      "@typescript-eslint/no-import-type-side-effects": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "ImportDeclaration[source.value='react']:not(:has(ImportNamespaceSpecifier[local.name='React']))",
          message:
            'Import React with `import * as React from "react";` and reference it as React.X (React.useState, React.ReactNode, …) instead of named or default imports.',
        },
      ],
    },
  },
  {
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "sanity.types.ts",
      "flavors/*/lib/cn-tables.ts",
      "next-env.d.ts",
    ],
  },
];

export default config;
