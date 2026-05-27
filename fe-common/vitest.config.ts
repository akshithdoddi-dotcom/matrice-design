import path from "path";
import { defineConfig } from "vitest/config";

import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      all: true,
      include: [
        "src/components/**/*.tsx",
        "src/components/**/*.ts",
        "src/lib/**/*.ts",
        "src/hooks/**/*.ts",
      ],
      exclude: [
        "**/*.stories.tsx",
        "**/*.test.tsx",
        "**/types.ts",
        "src/components/ui/index.ts",
        "src/components/primitives/index.ts",
        "src/components/ui/Charts/index.ts",
      ],
    },
  },
});
