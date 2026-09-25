import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettier,
  {
    // eslint-plugin-react's version auto-detection calls an API removed in ESLint 10.
    settings: { react: { version: "19.3" } },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports" },
      ],
    },
  },
  {
    ignores: [".next/**", "out/**", "node_modules/**", "sanity.types.ts", "next-env.d.ts"],
  },
];

export default config;
