import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Local-only dev server. The /api routes are proxied to the Hono bridge on 8787.
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    proxy: { "/api": "http://127.0.0.1:8787" },
  },
  build: { outDir: "dist" },
});
