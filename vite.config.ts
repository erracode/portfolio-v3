import fs from "node:fs"
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"

import { renderResumeStaticHtml, renderSeoHead, SEO_HEAD_END, SEO_HEAD_START } from "./src/seo/prerender"
import { ROUTE_META } from "./src/seo/route-meta"

/**
 * Per-route static HTML for crawlers that don't run JS (LinkedIn, Slack,
 * most social scrapers). Injects the "/" SEO tags into index.html (dev and
 * build), then after the build copies dist/index.html to dist/resume.html
 * with the "/resume" tags, `lang`, and a static version of the resume inside
 * #root. Cloudflare Pages serves `resume.html` at /resume directly (200, no
 * redirect); a `resume/index.html` folder would make it 308 /resume to
 * /resume/. There is deliberately no `public/_redirects`: Pages flags both
 * `/resume -> /resume.html` and the classic `/* /index.html 200` as infinite
 * loops and ignores them, and its built-in SPA fallback (active while the
 * build has no top-level 404.html) already serves index.html for every
 * other path.
 */
function seoPrerender(): Plugin {
  let outDir = ""
  let isBuild = false

  return {
    name: "seo-prerender",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
      isBuild = config.command === "build"
    },
    transformIndexHtml(html) {
      return html.replace("<!--seo-head-->", renderSeoHead("/"))
    },
    closeBundle() {
      if (!isBuild) return
      const html = fs.readFileSync(path.join(outDir, "index.html"), "utf8")
      const start = html.indexOf(SEO_HEAD_START)
      const end = html.indexOf(SEO_HEAD_END)
      if (start === -1 || end === -1) throw new Error("seo-prerender: SEO markers missing from dist/index.html")

      const resumeHtml = (html.slice(0, start) + renderSeoHead("/resume") + html.slice(end + SEO_HEAD_END.length))
        .replace(/<html lang="[^"]*">/, `<html lang="${ROUTE_META["/resume"].lang}">`)
        .replace('<div id="root"></div>', `<div id="root">${renderResumeStaticHtml()}</div>`)

      fs.writeFileSync(path.join(outDir, "resume.html"), resumeHtml)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), seoPrerender()],
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
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "embla-carousel-react",
      "vaul",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-slider",
      "@radix-ui/react-switch",
      "@radix-ui/react-label",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-progress",
      "@radix-ui/react-select",
      "@radix-ui/react-accordion",
      "@radix-ui/react-avatar",
      "@radix-ui/react-separator",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toggle",
      "@radix-ui/react-toggle-group",
    ],
  },
})
