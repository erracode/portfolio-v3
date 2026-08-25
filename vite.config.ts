import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Prevents a second copy of React from being bundled into optimized deps
    // (zustand's react/shallow etc.), which breaks hooks with "Invalid hook call".
    dedupe: ["react", "react-dom"],
  },
})
