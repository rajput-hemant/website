import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@\//,
        replacement: fileURLToPath(new URL("./", import.meta.url)),
      },
      {
        // The real package throws outside a Server Component; the module
        // itself ships this empty file for that case (its "react-server"
        // export condition), which plain Node/Vitest doesn't apply.
        find: "server-only",
        replacement: fileURLToPath(
          new URL("./node_modules/server-only/empty.js", import.meta.url)
        ),
      },
    ],
  },
  test: {
    environment: "node",
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/.next/**"],
  },
});
