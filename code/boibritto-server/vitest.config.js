const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.mjs"],
    testTimeout: 10000,
  },
});
