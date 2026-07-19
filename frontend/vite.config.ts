import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Pin port so backend CORS allow-list stays stable across local sessions.
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "https://modeval-api.bynipun.com",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ""),
        secure: true,
      },
    },
  },
})
