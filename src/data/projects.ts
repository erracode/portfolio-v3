import { Award, Layers, MapPin, Search, Store, TrendingUp, type LucideIcon } from "lucide-react"

export interface ProjectEntry {
  id: string
  name: string
  domain: string
  liveUrl?: string
  category: string
  summary: string
  /** English translation of `summary` — only the resume page's EN view
   * uses this; `WorkLogModal` (in-game) always renders `summary` (Spanish). */
  summaryEn: string
  architecture: string
  stack: string[]
  images: string[]
  icon: LucideIcon
  logo?: string
}

/** Personal products and apps — sourced directly from the user. Shared
 * between `WorkLogModal` (in-game project gallery) and the resume page's
 * Projects section, so there's one canonical list instead of two. */
export const PROJECTS: ProjectEntry[] = [
  {
    id: "aquetienda",
    name: "aquetienda.com",
    domain: "aquetienda.com",
    liveUrl: "https://aquetienda.com",
    category: "Producto SaaS",
    summary:
      "Plataforma para crear tiendas online gratis, sin código y sin comisiones, con pedidos que llegan directo a WhatsApp.",
    summaryEn:
      "Platform for building free online stores, no code and no commissions, with orders delivered straight to WhatsApp.",
    architecture:
      "Multi-tenant: cada negocio obtiene su tienda en su propio subdominio, con catálogo cargado a mano o importado por CSV, 32 temas personalizables, checkout que arma el pedido y lo envía por WhatsApp, página link-in-bio y verificador de precios por código de barras. Monorepo desplegado en Cloudflare Workers, con backend en Hono sobre runtime Bun y frontend en React 19 + Tailwind CSS v4; persistencia y autenticación vía Supabase, más un panel de gestión de pedidos, productos, marcas y categorías.",
    stack: [
      "Cloudflare Workers",
      "Hono",
      "Bun",
      "React 19",
      "Tailwind CSS v4",
      "shadcn/ui",
      "Supabase",
    ],
    images: [
      "/projects/aquetienda-1.webp",
      "/projects/aquetienda-2.png",
      "/projects/aquetienda-3.webp",
    ],
    icon: Store,
    logo: "/projects/aquetienda-logo.webp",
  },
  {
    id: "petsosciety",
    name: "petsosciety.app",
    domain: "petsosciety.app",
    liveUrl: "https://petsosciety.app",
    category: "Plataforma Comunitaria",
    summary: "Red comunitaria para reporte y búsqueda de mascotas perdidas.",
    summaryEn: "Community network for reporting and finding lost pets.",
    architecture:
      "Aplicación Next.js con Supabase como backend (Postgres + Realtime), usada para sincronizar en vivo un mapa interactivo de reportes. Estado de UI manejado con Zustand, animaciones con GSAP y contenido editorial servido como MDX.",
    stack: ["Next.js", "Supabase", "Zustand", "GSAP", "MDX", "shadcn/ui"],
    images: [
      "/projects/petsosciety-1.webp",
      "/projects/petsosciety-2.webp",
    ],
    icon: MapPin,
    logo: "/projects/petsosciety-logo.webp",
  },
  {
    id: "aquetasa",
    name: "aquetasa.app",
    domain: "aquetasa.app",
    liveUrl: "https://aquetasa.app",
    category: "App + Landing",
    summary: "Monitor de tasas de cambio con landing informativa y app móvil.",
    summaryEn: "Exchange-rate monitor with an informational landing page and a mobile app.",
    architecture:
      "Landing site construido en Astro para maximizar el rendimiento de la primera carga, desacoplado de una aplicación móvil independiente en React Native que consume la misma fuente de tasas.",
    stack: ["Astro", "React Native"],
    images: [
      "/projects/aquetasa-1.webp",
      "/projects/aquetasa-2.webp",
      "/projects/aquetasa-3.webp",
    ],
    icon: TrendingUp,
    logo: "/projects/aquetasa-logo.webp",
  },
  {
    id: "point-party",
    name: "Point Party",
    domain: "story-point-poker-react.pages.dev",
    liveUrl: "https://story-point-poker-react.pages.dev",
    category: "Herramienta Interna",
    summary:
      "Herramienta de estimación ágil (planning poker) adoptada internamente por equipos de ingeniería.",
    summaryEn: "Agile estimation tool (planning poker), adopted internally by engineering teams.",
    architecture:
      "SPA en React + TypeScript con componentes de Radix UI, sin backend propio: la sincronización de sesiones se resuelve completamente en el cliente. Adoptada como herramienta de facto en ceremonias de estimación de varios equipos.",
    stack: ["React", "TypeScript", "Radix UI"],
    images: [
      "/projects/point-party-1.png",
      "/projects/point-party-2.png",
      "/projects/point-party-3.png",
    ],
    icon: Layers,
    logo: "/projects/point-party-logo.webp",
  },
  {
    id: "opencode-obsidian",
    name: "opencode-obsidian",
    domain: "Servidor MCP",
    category: "Servidor MCP",
    summary: "Servidor MCP con búsqueda semántica sobre notas de Obsidian.",
    summaryEn: "MCP server with semantic search over Obsidian notes.",
    architecture:
      "Servidor que implementa el Model Context Protocol (MCP), exponiendo búsqueda semántica (RAG) sobre un vault de Obsidian e integrándola con work items de Azure DevOps, para consultar contexto de notas técnicas directamente durante el flujo de trabajo.",
    stack: ["MCP", "RAG", "Azure DevOps"],
    images: ["/placeholder.svg"],
    icon: Search,
  },
  {
    id: "engram-contest",
    name: "Engram Landing Contest",
    domain: "engram-landing-34c.pages.dev",
    liveUrl: "https://engram-landing-34c.pages.dev",
    category: "Contest / Landing Page",
    summary:
      "Landing para Engram, memoria persistente para agentes de IA — presentada en un concurso de landings.",
    summaryEn: "Landing page for Engram, persistent memory for AI agents — submitted to a landing-page contest.",
    architecture:
      "Landing en Astro con escena 3D de React Three Fiber, estilos con Tailwind CSS v4 y animaciones con Framer Motion, desplegada en Cloudflare Pages.",
    stack: ["Astro", "React 19", "Three.js", "Tailwind CSS v4", "Cloudflare Pages"],
    images: [
      "/projects/engram-contest-1.webp",
      "/projects/engram-contest-2.webp",
    ],
    icon: Award,
  },
]

/** Same curated set as `cv-senior-software-engineer.md`'s "Selected
 * Projects" — a deliberate subset of the full `WorkLogModal` gallery, not
 * every side project. Lives here (not in `ResumeProjects`) so the build-time
 * `/resume` prerender (`src/seo/prerender.ts`) lists the exact same cards. */
const RESUME_FEATURED_PROJECT_IDS = ["aquetienda", "point-party", "petsosciety", "aquetasa", "opencode-obsidian"]

export function getResumeFeaturedProjects(): ProjectEntry[] {
  return RESUME_FEATURED_PROJECT_IDS.map((id) => PROJECTS.find((project) => project.id === id)).filter(
    (project) => project !== undefined
  )
}
