import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Fetching data inside effects is the pattern used across these pages;
      // this advisory React-Compiler rule flags every one of them.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  globalIgnores([".next/**", "generated/**", "out/**", "build/**", "next-env.d.ts", ".agents/**"]),
]);
