import { useEffect } from "react"
import { play } from "cuelume"
import {
  Building2,
  Layers,
  MapPin,
  Search,
  Store,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/8bit/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/8bit/tabs"
import { WowDraggableWindow } from "@/components/wow/wow-draggable-window"

interface WorkLogModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ProductEntry {
  id: string
  name: string
  domain: string
  description: string
  stack: string[]
  icon: LucideIcon
}

/** Personal products and apps — sourced directly from the user. */
const PERSONAL_PRODUCTS: ProductEntry[] = [
  {
    id: "aquetienda",
    name: "aquetienda.com",
    domain: "app.aquetienda.com",
    description:
      "Sheet-to-Store Engine. Monorepo con dashboard de gestión y módulo linktree (paugurumi.aquetienda.com/links).",
    stack: [
      "Cloudflare Workers",
      "Hono",
      "Bun",
      "React 19",
      "Tailwind CSS v4",
      "shadcn/ui",
      "Supabase",
    ],
    icon: Store,
  },
  {
    id: "petsosciety",
    name: "petsosciety.app",
    domain: "petsosciety.app",
    description:
      "Plataforma comunitaria para reporte de mascotas perdidas, con mapa interactivo en tiempo real.",
    stack: ["Next.js", "Supabase", "Zustand", "GSAP", "MDX", "shadcn/ui"],
    icon: MapPin,
  },
  {
    id: "aquetasa",
    name: "aquetasa.app",
    domain: "aquetasa.app",
    description:
      "Monitor de tasas de cambio. Landing site en Astro y aplicación móvil en React Native.",
    stack: ["Astro", "React Native"],
    icon: TrendingUp,
  },
  {
    id: "story-point-poker",
    name: "Story Point Poker",
    domain: "story-point-poker-react.pages.dev",
    description:
      "Herramienta de estimación ágil adoptada por equipos de ingeniería.",
    stack: ["React", "TypeScript", "Radix UI"],
    icon: Layers,
  },
  {
    id: "opencode-obsidian",
    name: "opencode-obsidian",
    domain: "Servidor MCP",
    description:
      "Servidor MCP con búsqueda semántica (RAG) para integración entre Obsidian y Azure DevOps.",
    stack: ["MCP", "RAG", "Azure DevOps"],
    icon: Search,
  },
]

interface WorkItem {
  id: string
  title: string
  description: string
  image?: string
}

interface EmployerEntry {
  id: string
  name: string
  role: string
  period: string
  logo?: string
  items: WorkItem[]
}

/** Employers and client engagements — sourced directly from the user. */
const WORK_HISTORY: EmployerEntry[] = [
  {
    id: "sundevs",
    name: "SunDevs Inc",
    role: "Senior Full-Stack Engineer — Cinemark LATAM",
    period: "Ene 2023 – Presente",
    logo: "/companies/sundevs-logo.png",
    items: [
      {
        id: "cinemark-platform",
        title: "Ecosistema Cinemark",
        description:
          "Liderazgo en 3 frontends (React 18, Next.js, Ant Design v5) y 8 microservicios en NestJS, Express y Serverless, para operaciones en 12 países.",
      },
      {
        id: "ckc-api-commons",
        title: "@sundevs/ckc-api-commons",
        description:
          "Librería compartida publicada en AWS CodeArtifact; integración de 9 pasarelas de pago.",
      },
    ],
  },
  {
    id: "awsh",
    name: "Awsh",
    role: "Senior Software Engineer",
    period: "Feb 2021 – Presente",
    logo: "/companies/awsh-logo.jpg",
    items: [
      {
        id: "hui",
        title: "HUI",
        description:
          "Plataforma interna para aprovisionamiento y gestión de instancias de WordPress vía cPanel API/SSH y plantillas.",
        image: "/projects/hui-wordpress-1.png",
      },
      {
        id: "hb-reconciler",
        title: "HB Reconciler",
        description:
          "Sistema de conciliación financiera con cron jobs distribuidos entre Zoho CRM, PayTrace, NMI y Stripe.",
        image: "/projects/app-reconciler-1.png",
      },
      {
        id: "firearms-ecommerce",
        title: "E-Commerce de Armas",
        description: "Plataforma regulada con Next.js, PayloadCMS y Authorize.net.",
        image: "/projects/awsh-ecommerce-1.png",
      },
      {
        id: "system-scraper",
        title: "System Scraper",
        description: "Web scraping distribuido de +20.000 dominios con Agenda.js.",
        image: "/projects/bot-scraper-1.png",
      },
      {
        id: "eliason-law",
        title: "Eliason Law Office",
        description: "Cliente — eliasonlaw.org.",
        image: "/projects/eliason-law-1.png",
      },
    ],
  },
  {
    id: "studio73",
    name: "Studio73",
    role: "Web Coordinator",
    period: "Ene 2021 – Ene 2023",
    logo: "/companies/studio-logo.png",
    items: [
      {
        id: "studio73-clients",
        title: "Infraestructura Cloud & Desarrollo de Clientes",
        description:
          "Panamá Leagues, LPK, Gran Fondo (granfondo.probidsida.org), Grupo Romarin (gruporomarin.com) y Legal Food Panama (legalfoodpa.com).",
        image: "/projects/studio73-1.png",
      },
    ],
  },
  {
    id: "freelance",
    name: "Freelance & Client Works",
    role: "Ingeniero de Software Freelance",
    period: "",
    items: [
      {
        id: "catatumbo",
        title: "Catatumbo Technology",
        description: "Sitio corporativo multilingüe — catatumbotech.com.",
        image: "/projects/catatumbo-tech-1.png",
      },
      {
        id: "everythingwebsites",
        title: "Everything Websites",
        description: "everythingwebsites.com.",
        image: "/projects/everything-websites-1.png",
      },
      {
        id: "erracode",
        title: "ErraCode",
        description: "erracode.pages.dev.",
      },
    ],
  },
]

function ProductCard({ product }: { product: ProductEntry }) {
  const Icon = product.icon

  return (
    <div className="relative flex flex-col gap-2 border-y-6 border-foreground bg-card p-3 dark:border-ring">
      <div className="flex items-center gap-2 border-b-4 border-border pb-2">
        <Icon className="size-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold tracking-wide uppercase">
            {product.name}
          </p>
          <p className="truncate font-sans text-[9px] text-muted-foreground">
            {product.domain}
          </p>
        </div>
      </div>

      <p className="font-sans text-[10px] leading-relaxed text-muted-foreground">
        {product.description}
      </p>

      <div className="flex flex-wrap gap-1">
        {product.stack.map((tech) => (
          <Badge
            key={tech}
            variant="outline"
            font="normal"
            className="px-1.5 py-0.5 text-[9px]"
          >
            {tech}
          </Badge>
        ))}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-inherit"
      />
    </div>
  )
}

function ProductsTab() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {PERSONAL_PRODUCTS.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function WorkItemRow({ item }: { item: WorkItem }) {
  return (
    <div className="flex items-start gap-3 border-b-2 border-dashed border-border py-2 last:border-b-0">
      <div className="relative size-10 shrink-0 border-y-4 border-foreground bg-background dark:border-ring">
        {item.image ? (
          <img
            src={item.image}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <Building2
            className="absolute inset-0 m-auto size-4 text-muted-foreground"
            aria-hidden="true"
          />
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -mx-1 border-x-4 border-inherit"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold">{item.title}</p>
        <p className="mt-0.5 font-sans text-[10px] leading-relaxed text-muted-foreground">
          {item.description}
        </p>
      </div>
    </div>
  )
}

function EmployerSection({ employer }: { employer: EmployerEntry }) {
  return (
    <section className="relative border-y-6 border-foreground bg-card dark:border-ring">
      <header className="flex flex-wrap items-center gap-2 border-b-4 border-border px-3 py-2">
        {employer.logo ? (
          <img
            src={employer.logo}
            alt=""
            loading="lazy"
            className="size-6 shrink-0 rounded-sm object-cover"
          />
        ) : (
          <Building2
            className="size-5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-bold tracking-wide uppercase">
            {employer.name}
          </p>
          <p className="truncate font-sans text-[9px] text-muted-foreground">
            {employer.role}
          </p>
        </div>
        {employer.period && (
          <span className="shrink-0 font-sans text-[9px] text-muted-foreground">
            {employer.period}
          </span>
        )}
      </header>

      <div className="px-3">
        {employer.items.map((item) => (
          <WorkItemRow key={item.id} item={item} />
        ))}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-inherit"
      />
    </section>
  )
}

function TrajectoryTab() {
  return (
    <div className="flex flex-col gap-4">
      {WORK_HISTORY.map((employer) => (
        <EmployerSection key={employer.id} employer={employer} />
      ))}
    </div>
  )
}

/**
 * Work Log — bound to the 'L' hotkey / micro-menu icon. Two tabs: personal
 * products/apps, and professional trajectory grouped by employer/client.
 */
export function WorkLogModal({ isOpen, onClose }: WorkLogModalProps) {
  useEffect(() => {
    if (isOpen) play("ready")
  }, [isOpen])

  return (
    <WowDraggableWindow
      id="quests"
      isOpen={isOpen}
      onClose={onClose}
      className="h-[600px] w-[min(720px,calc(100svw-2rem))] max-h-[90svh]"
    >
      <header
        data-window-drag-handle
        className="flex cursor-move touch-none items-center border-b-4 border-border px-4 py-3 pr-12 select-none"
      >
        <h2 className="retro text-xs leading-snug">
          Registro de Misiones & Proyectos
        </h2>
      </header>

      <Tabs defaultValue="products" className="min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <TabsContent value="products" className="mt-0">
            <ProductsTab />
          </TabsContent>
          <TabsContent value="trajectory" className="mt-0">
            <TrajectoryTab />
          </TabsContent>
        </div>

        {/* Same hanging-flap recipe as the other micro-menu windows. */}
        <TabsList className="absolute -bottom-9 left-3 w-fit">
          <TabsTrigger value="products" data-cuelume-toggle="page">
            Productos & Apps Personales
          </TabsTrigger>
          <TabsTrigger value="trajectory" data-cuelume-toggle="page">
            Trayectoria Laboral & Clientes
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </WowDraggableWindow>
  )
}
