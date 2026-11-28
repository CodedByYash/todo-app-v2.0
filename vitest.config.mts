import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname) } },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Integration tests share one database, so run files one at a time.
    fileParallelism: false,
    testTimeout: 20_000,
    env: { NEXTAUTH_SECRET: "test-secret-test-secret-test-secret" },
  },
});
