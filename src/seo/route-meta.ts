import { getResumeContent } from "../data/resume"

/**
 * Single source of truth for every route's <head> tags. Read in two places:
 * at build time by the `seoPrerender` plugin in `vite.config.ts` (bakes the
 * tags into `dist/index.html` and `dist/resume.html`, which is what
 * non-JS crawlers like LinkedIn's scraper actually see), and at runtime by
 * `RouteHead` (rewrites the same tags on client-side navigation, since a
 * SPA otherwise keeps whatever the first-loaded HTML declared).
 *
 * Pure data, no DOM/Node access — and relative imports only, so the Vite
 * config bundler can load it without the `@/` alias.
 */

export const SITE_URL = "https://erracode.pages.dev"

export type SeoPath = "/" | "/resume"

/** Per-route social card. The PNGs are generated at build time by the
 * `ogImages` plugin (`plugins/og-images.ts`) into `dist/og/` — `path` is
 * both where it's emitted and what `og:image` points to. */
export interface OgImageSpec {
  path: string
  alt: string
  /** Pixel badge above the name. */
  badge: string
  tagline: string
  /** Decorative XP bar fill, out of 20 cells. */
  xpFilled: number
}

export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630

export const OG_IMAGES: Record<SeoPath, OgImageSpec> = {
  "/": {
    path: "/og/og-home.png",
    alt: "Jesús Díaz, Senior Full-Stack Engineer — portfolio interactivo estilo WoW en 3D",
    badge: "PORTFOLIO",
    tagline: "Portfolio interactivo estilo WoW en 3D",
    xpFilled: 17,
  },
  "/resume": {
    path: "/og/og-resume.png",
    alt: "Jesús Díaz, Senior Full-Stack Engineer — resume",
    badge: "RESUME",
    tagline: "Resume · React, Next.js, Node.js/NestJS, TypeScript",
    xpFilled: 20,
  },
}

export function ogImageUrl(path: SeoPath): string {
  return `${SITE_URL}${OG_IMAGES[path].path}`
}

export interface RouteMeta {
  title: string
  description: string
  /** Shorter social-card copy; falls back to `description`. */
  socialDescription?: string
  lang: "es" | "en"
  ogType: "website" | "profile"
  ogLocale: string
  ogLocaleAlternate?: string
}

const resumeEn = getResumeContent("en")

export const ROUTE_META: Record<SeoPath, RouteMeta> = {
  "/": {
    title: "Jesús Díaz — Software Engineer Portfolio",
    description:
      "Portfolio interactivo de Jesús Díaz, Senior Full-Stack Engineer — un mundo 3D estilo World of Warcraft donde explorar proyectos, experiencia, stack técnico y logros.",
    socialDescription:
      "Portfolio interactivo estilo World of Warcraft: proyectos, experiencia, stack técnico y logros en un mundo 3D explorable.",
    lang: "es",
    ogType: "website",
    ogLocale: "es_ES",
  },
  // English by default, matching `resume-locale-store`'s default — the
  // resume is the ATS/recruiter-facing page.
  "/resume": {
    title: `Jesús Díaz — ${resumeEn.title} | Resume`,
    description: `Resume of Jesús Díaz, ${resumeEn.title} (${resumeEn.tagline}). Experience, selected projects, technical skills and education.`,
    lang: "en",
    ogType: "profile",
    ogLocale: "en_US",
    ogLocaleAlternate: "es_ES",
  },
}

export function canonicalUrl(path: SeoPath): string {
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`
}

/** Unknown paths fall back to the home meta — same as the SPA fallback
 * serving `index.html` for them. */
export function resolveSeoPath(pathname: string): SeoPath {
  const normalized = pathname.replace(/\/+$/, "") || "/"
  return normalized in ROUTE_META ? (normalized as SeoPath) : "/"
}
