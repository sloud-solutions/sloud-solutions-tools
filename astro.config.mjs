// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  build: { format: "directory" },
  vite: {
    plugins: [tailwindcss()],
    // amazon-cognito-identity-js expects a Node-style `global` object.
    define: { global: "globalThis" },
  },
});
