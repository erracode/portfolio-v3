import { useEffect } from "react"
import { useRouterState } from "@tanstack/react-router"

import { useResumeLocaleStore } from "@/lib/resume-locale-store"
import { canonicalUrl, OG_IMAGES, ogImageUrl, resolveSeoPath, ROUTE_META } from "@/seo/route-meta"

function setAttr(selector: string, attribute: string, value: string) {
  document.head.querySelector(selector)?.setAttribute(attribute, value)
}

/** `og:locale:alternate` only exists on routes that declare one, so unlike
 * the other tags it has to be created/removed, not just rewritten. Placed
 * right after `og:locale` to mirror the prerendered order. */
function syncLocaleAlternate(value: string | undefined) {
  const existing = document.head.querySelector('meta[property="og:locale:alternate"]')
  if (!value) {
    existing?.remove()
    return
  }
  if (existing) {
    existing.setAttribute("content", value)
    return
  }
  const tag = document.createElement("meta")
  tag.setAttribute("property", "og:locale:alternate")
  tag.setAttribute("content", value)
  const locale = document.head.querySelector('meta[property="og:locale"]')
  if (locale) locale.after(tag)
  else document.head.append(tag)
}

/**
 * Renderless: keeps the static SEO tags baked into the HTML (see `renderSeoHead`) in
 * sync with the current route on client-side navigation. Updates the
 * existing tags in place rather than rendering new ones — TanStack
 * Router's `<HeadContent />` / React 19 tag hoisting would append a second
 * <title>/canonical next to the static ones instead of replacing them.
 * The Person JSON-LD is identical on every route, so it's left static.
 */
export function RouteHead() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const resumeLocale = useResumeLocaleStore((state) => state.locale)

  useEffect(() => {
    const path = resolveSeoPath(pathname)
    const meta = ROUTE_META[path]
    const url = canonicalUrl(path)
    const social = meta.socialDescription ?? meta.description

    document.title = meta.title
    // The resume has its own EN/ES toggle; `lang` follows it so screen
    // readers pronounce the visible content correctly.
    document.documentElement.lang = path === "/resume" ? resumeLocale : meta.lang
    setAttr('meta[name="description"]', "content", meta.description)
    setAttr('link[rel="canonical"]', "href", url)
    setAttr('meta[property="og:url"]', "content", url)
    setAttr('meta[property="og:title"]', "content", meta.title)
    setAttr('meta[property="og:description"]', "content", social)
    setAttr('meta[property="og:type"]', "content", meta.ogType)
    setAttr('meta[property="og:locale"]', "content", meta.ogLocale)
    syncLocaleAlternate(meta.ogLocaleAlternate)
    setAttr('meta[name="twitter:title"]', "content", meta.title)
    setAttr('meta[name="twitter:description"]', "content", social)
    setAttr('meta[property="og:image"]', "content", ogImageUrl(path))
    setAttr('meta[property="og:image:alt"]', "content", OG_IMAGES[path].alt)
    setAttr('meta[name="twitter:image"]', "content", ogImageUrl(path))
    setAttr('meta[name="twitter:image:alt"]', "content", OG_IMAGES[path].alt)
  }, [pathname, resumeLocale])

  return null
}
