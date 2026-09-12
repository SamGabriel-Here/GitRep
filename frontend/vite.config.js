import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In production the built site and the API are served from one origin, so the
// app only ever calls /api/... with no base URL. The dev proxy reproduces that
// locally against the uvicorn server.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
