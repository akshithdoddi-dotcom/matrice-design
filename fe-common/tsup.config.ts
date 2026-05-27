import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/primitives.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: false,
  minify: true,
  external: ["react", "react-dom", "react-hook-form", "recharts"],
  banner: {
    js: '"use client";',
  },
  outExtension({ format }) {
    return { js: format === "esm" ? ".mjs" : ".cjs" };
  },
});
