import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 15000,

    globals: true,

    environment: "node",

    env: {
      NODE_ENV: "test",
    },

    include: ["src/**/*.test.ts"],

    setupFiles: ["./src/tests/helpers/database.ts"],

    // IMPORTANT
    pool: "forks",

    fileParallelism: false,

    coverage: {
      provider: "v8",

      reporter: ["text", "html"],
    },
  },
});
