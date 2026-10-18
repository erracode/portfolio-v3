import { getResumeFeaturedProjects } from "../data/projects"
import { getResumeContent, getResumeLabels } from "../data/resume"
import { CONTACT_LINKS } from "../data/sections"
import {
  canonicalUrl,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  OG_IMAGES,
  ogImageUrl,
  ROUTE_META,
  SITE_URL,
  type SeoPath,
} from "./route-meta"

/**
 * Build-time only (imported by `vite.config.ts`, never by the app): turns
 * the route meta and resume data into plain HTML strings for the static
 * per-route HTML files.
 *
 * The resume body is rendered with a string template from the data modules
 * instead of `renderToString(<ResumePage />)` — the page's components touch
 * `window` at render time (`ResumeWalker`/`ResumeZergRush` initial state,
 * persisted zustand stores), so they aren't SSR-safe. The markup only has
 * to exist for crawlers without JS; `createRoot` replaces it on mount.
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export const SEO_HEAD_START = "<!-- seo:start -->"
export const SEO_HEAD_END = "<!-- seo:end -->"

function renderPersonJsonLd(): string {
  const resume = getResumeContent("en")
  const sameAs = CONTACT_LINKS.map((link) => link.href).filter((href) => href.startsWith("https://"))

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Jesús Díaz",
    alternateName: resume.name,
    jobTitle: resume.title,
    url: `${SITE_URL}/`,
    image: `${SITE_URL}${resume.photo}`,
    email: `mailto:${resume.email}`,
    sameAs,
  }

  // `<` escaped so no string value can ever close the <script> early.
  return `<script type="application/ld+json">${JSON.stringify(person).replace(/</g, "\\u003c")}</script>`
}

/** Every SEO tag for one route, wrapped in markers so the resume variant
 * can swap the whole block instead of regex-patching individual tags. */
export function renderSeoHead(path: SeoPath): string {
  const meta = ROUTE_META[path]
  const url = canonicalUrl(path)
  const social = escapeHtml(meta.socialDescription ?? meta.description)
  const title = escapeHtml(meta.title)
  const image = ogImageUrl(path)
  const imageAlt = escapeHtml(OG_IMAGES[path].alt)

  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${meta.ogType}" />`,
    `<meta property="og:site_name" content="Jesús Díaz" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${social}" />`,
    `<meta property="og:locale" content="${meta.ogLocale}" />`,
    meta.ogLocaleAlternate && `<meta property="og:locale:alternate" content="${meta.ogLocaleAlternate}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:type" content="image/png" />`,
    `<meta property="og:image:width" content="${OG_IMAGE_WIDTH}" />`,
    `<meta property="og:image:height" content="${OG_IMAGE_HEIGHT}" />`,
    `<meta property="og:image:alt" content="${imageAlt}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${social}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<meta name="twitter:image:alt" content="${imageAlt}" />`,
    renderPersonJsonLd(),
  ].filter(Boolean)

  return [SEO_HEAD_START, ...tags, SEO_HEAD_END].join("\n    ")
}

/** Semantic, lightly styled resume markup (English, the page's default
 * locale) injected into `#root` of `dist/resume.html`. */
export function renderResumeStaticHtml(): string {
  const resume = getResumeContent("en")
  const labels = getResumeLabels("en")
  const e = escapeHtml

  const contact = CONTACT_LINKS.map((link) => `<a href="${e(link.href)}">${e(link.handle)}</a>`).join(" · ")

  const work = resume.work
    .map(
      (job) => `<article class="flex flex-col gap-1">
        <h3 class="font-bold">${e(job.role)} — ${e(job.company)}</h3>
        <p class="text-xs opacity-70">${e(job.period)} · ${e(job.location)}</p>
        ${job.intro ? `<p>${e(job.intro)}</p>` : ""}
        <ul class="list-disc pl-5">${job.highlights.map((item) => `<li>${e(item)}</li>`).join("")}</ul>
      </article>`
    )
    .join("")

  const projects = getResumeFeaturedProjects()
    .map(
      (project) =>
        `<li><strong>${project.liveUrl ? `<a href="${e(project.liveUrl)}">${e(project.name)}</a>` : e(project.name)}</strong> — ${e(project.summaryEn)} <span class="opacity-70">(${e(project.stack.join(", "))})</span></li>`
    )
    .join("")

  const skills = resume.skills
    .map((group) => `<li><strong>${e(group.label)}:</strong> ${e(group.items.map((item) => item.name).join(", "))}</li>`)
    .join("")

  return `<main class="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12 font-sans text-sm leading-relaxed">
      <header>
        <h1 class="text-lg font-bold">${e(resume.name)}</h1>
        <p>${e(resume.title)} | ${e(resume.tagline)}</p>
        <p>${e(resume.location)} · ${e(resume.languages)}</p>
        <p>${contact}</p>
      </header>
      <section><h2 class="font-bold">${e(labels.summary)}</h2><p>${e(resume.summary)}</p></section>
      <section class="flex flex-col gap-4"><h2 class="font-bold">${e(labels.experience)}</h2>${work}</section>
      <section><h2 class="font-bold">${e(labels.education)}</h2><p>${e(resume.educationDegree)} — ${e(resume.education.school)} (${e(resume.education.period)})</p></section>
      <section><h2 class="font-bold">${e(labels.projects)}</h2><ul class="list-disc pl-5">${projects}</ul></section>
      <section><h2 class="font-bold">${e(labels.skills)}</h2><ul>${skills}</ul></section>
    </main>`
}
