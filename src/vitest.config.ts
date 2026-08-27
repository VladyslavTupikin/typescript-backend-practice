// Copyright (c) 2026 Vladyslav Tupikin
// SPDX-License-Identifier: ISC

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    // Optional: Enables static type testing via `tsc` or `vue-tsc`
    typecheck: {
      enabled: true,
    },
    coverage: {
      provider: "v8", // Default mechanism
      reporter: ["text", "lcov", "html"], // Formats generated from V8 data
    },
  },
});
