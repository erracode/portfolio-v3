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
  optimizeDeps: {
    // Pre-bundle every external dep up front at cold start instead of
    // discovering them incrementally as new files import them — the latter
    // triggers a "re-optimizing dependencies" full-page reload mid-session
    // (felt as "slow the first few times" while adding new components).
    include: [
      "lucide-react",
      "cuelume",
      "zustand",
      "zustand/react/shallow",
      "zustand/middleware",
      "clsx",
      "tailwind-merge",
      "class-variance-authority",
      "radix-ui",
    ],
  },
})
