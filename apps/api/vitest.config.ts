import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,

    environment: "node",

    env: {
      NODE_ENV: "test",
    },

    include: ["src/**/*.test.ts"],

    setupFiles: ["./src/tests/helpers/database.ts"],

    coverage: {
      provider: "v8",

      reporter: ["text", "html"],
    },
  },
});
