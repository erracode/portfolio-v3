import { useEffect, useState } from "react"
import { play } from "cuelume"
import {
  ArrowLeft,
  Award,
  Building2,
  ExternalLink,
  Layers,
  MapPin,
  Search,
  Store,
  TrendingUp,
  X,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/8bit/badge"
import { Button } from "@/components/ui/8bit/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/8bit/carousel"
import { SaveSlots, type SaveSlot } from "@/components/ui/8bit/blocks/save-slots"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/8bit/tabs"
import { Drawer, DrawerClose, DrawerContent, DrawerTitle } from "@/components/ui/8bit/drawer"
import { ScrollArea } from "@/components/ui/8bit/scroll-area"
import { WowDraggableWindow } from "@/components/wow/wow-draggable-window"
import { useQuestStore } from "@/lib/quest-store"
import { useIsMobile } from "@/lib/use-is-mobile"

interface WorkLogModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ProjectEntry {
  id: string
  name: string
  domain: string
  liveUrl?: string
  category: string
  summary: string
  architecture: string
  stack: string[]
  images: string[]
  icon: LucideIcon
  logo?: string
}

/** Personal products and apps — sourced directly from the user. */
const PROJECTS: ProjectEntry[] = [
  {
    id: "aquetienda",
    name: "aquetienda.com",
    domain: "app.aquetienda.com",
    liveUrl: "https://app.aquetienda.com",
    category: "Producto SaaS",
    summary:
      "Sheet-to-Store Engine — motor de tiendas online generadas a partir de hojas de cálculo.",
    architecture:
      "Monorepo desplegado en Cloudflare Workers, con backend en Hono sobre runtime Bun y frontend en React 19 + Tailwind CSS v4. Persistencia y autenticación vía Supabase. Incluye un dashboard de gestión de catálogo y un módulo linktree independiente (paugurumi.aquetienda.com/links) que comparte el mismo monorepo y pipeline de despliegue.",
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

const PROJECT_SLOTS: SaveSlot[] = [
  ...PROJECTS.map((project) => ({
    id: project.id,
    isEmpty: false,
    name: project.name,
    description: project.category,
    preview: project.logo,
  })),
  // An open slot on purpose — an invitation to build the next project together.
  {
    id: "next-collab",
    isEmpty: true,
    name: "¿Tienes un proyecto en mente?",
    description: "Escríbeme y lo construimos juntos.",
  },
]

interface WorkItem {
  id: string
  title: string
  description: string
  image?: string
  /** Optional gallery for work items with multiple screenshots. When set,
   * `WorkItemRow` renders a small carousel instead of the single thumb. */
  images?: string[]
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
          "Librería compartida publicada en AWS CodeArtifact, integrada en cada microservicio para reemplazar llamadas HTTPS por invocaciones Lambda internas.",
      },
      {
        id: "ckc-ecosystem",
        title: "Ecosistema ckc-* / cnk-*",
        description:
          "Contribuciones en los repos ckc-* y en cnk-products-service/cnk-backoffice-ui; mantenimiento continuo del frontend ckc-website (Colombia) desde su inicio, además de aprovisionamiento de backoffice y productos en Azure para operaciones LATAM.",
      },
    ],
  },
  {
    id: "awsh",
    name: "Awsh",
    role: "Senior Software Engineer",
    period: "Feb 2021 – Presente (colaboración estacional)",
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
      {
        id: "backup-system",
        title: "Backup System",
        description:
          "Sistema full-stack de respaldo: plugin de WordPress construido con CodeIgniter, más una web para gestionar, programar y descargar respaldos, con pagos por suscripción. El plugin fue publicado y aprobado en el directorio oficial de WordPress.",
        image: "/projects/backup-system-1.png",
        images: ["/projects/backup-system-1.png", "/projects/backup-system-2.png"],
      },
      {
        id: "gta-faction",
        title: "GTA Faction",
        description:
          "Dashboard MERN para administrar un servidor de roleplay de GTA 5: pines de mapa, gestión de recursos, administración de clases y más.",
        image: "/projects/gta-faction-1.png",
        images: [
          "/projects/gta-faction-1.png",
          "/projects/gta-faction-2.png",
          "/projects/gta-faction-3.png",
        ],
      },
      {
        id: "enchanted-thoughts",
        title: "Enchanted Thoughts",
        description:
          "Página full-stack (Next.js + Express + motor de IA) de 2022: un wizard para generar cartas personalizadas con IA para familiares y niños.",
        image: "/projects/enchanted-thoughts-1.png",
        images: ["/projects/enchanted-thoughts-1.png", "/projects/enchanted-thoughts-2.jpg"],
      },
      {
        id: "indeleble-gifts",
        title: "Indeleble Gifts",
        description: "Landing page de regalos con Astro.",
        image: "/projects/indeleble-gifts-1.png",
      },
    ],
  },
  {
    id: "studio73",
    name: "Studio73",
    role: "De Programador Full-Stack a Líder del Departamento de Programación",
    period: "Ene 2021 – Ene 2023",
    logo: "/companies/studio-logo.png",
    items: [
      {
        id: "studio73-clients",
        title: "Desarrollo WordPress para Clientes LATAM y Panamá",
        description:
          "Sitios y plataformas para numerosos clientes en Latinoamérica y Panamá, entre ellos Gran Fondo (granfondo.probidsida.org), Grupo Romarin (gruporomarin.com) y Legal Food Panama (legalfoodpa.com).",
        image: "/projects/studio73-1.png",
        images: [
          "/projects/studio73-1.png",
          "/projects/studio73-2.png",
          "/projects/studio73-3.png",
          "/projects/studio73-4.png",
          "/projects/studio73-5.png",
          "/projects/studio73-6.png",
          "/projects/studio73-7.png",
          "/projects/studio73-8.png",
          "/projects/studio73-9.png",
          "/projects/studio73-10.png",
          "/projects/studio73-11.png",
          "/projects/studio73-12.png",
        ],
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
        id: "kaironyx",
        title: "Kaironyx Labs",
        description: "kaironyx-labs-landing.pages.dev.",
        image: "/projects/kaironyx-1.webp",
      },
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
        id: "pixieplayevents",
        title: "PixiePlayEvents.com",
        description: "Sitio de gestión de eventos.",
        image: "/projects/pixie-play-2.webp",
      },
    ],
  },
]

function ProjectDetailView({
  project,
  onBack,
}: {
  project: ProjectEntry
  onBack: () => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onBack}
        className="w-fit"
        data-cuelume-press
        data-cuelume-release
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Volver a Proyectos
      </Button>

      <div className="flex items-center gap-2 border-b-4 border-border pb-2">
        <project.icon
          className="size-5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <h3 className="min-w-0 flex-1 truncate text-xs font-bold tracking-wide uppercase">
          {project.name}
        </h3>
      </div>

      <Carousel className="px-8">
        <CarouselContent>
          {project.images.map((image, index) => (
            <CarouselItem key={image + index}>
              <img
                src={image}
                alt=""
                loading="lazy"
                className="aspect-video w-full border-y-4 border-foreground bg-background object-cover dark:border-ring"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        {project.images.length > 1 && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}
      </Carousel>

      <p className="font-sans text-xs leading-relaxed text-muted-foreground">
        {project.architecture}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {project.stack.map((tech) => (
          <Badge
            key={tech}
            variant="outline"
            font="normal"
            className="px-1.5 py-0.5 text-[11px]"
          >
            {tech}
          </Badge>
        ))}
      </div>

      {project.liveUrl && (
        <Button asChild size="sm" className="w-fit">
          <a href={project.liveUrl} target="_blank" rel="noreferrer">
            <ExternalLink className="size-3.5" aria-hidden="true" />
            Visitar Proyecto
          </a>
        </Button>
      )}
    </div>
  )
}

function ProjectsTab() {
  const [detailProjectId, setDetailProjectId] = useState<string | null>(null)
  const detailProject = PROJECTS.find((entry) => entry.id === detailProjectId)

  const handleSlotClick = (slot: SaveSlot) => {
    if (PROJECTS.some((entry) => entry.id === slot.id)) {
      setDetailProjectId(slot.id)
      useQuestStore.getState().completeObjectiveIfAccepted("view-project")
    }
  }

  if (detailProject) {
    return (
      <ProjectDetailView
        project={detailProject}
        onBack={() => setDetailProjectId(null)}
      />
    )
  }

  return (
    <SaveSlots
      slots={PROJECT_SLOTS}
      onSlotClick={handleSlotClick}
      title=""
      showSavedBadge={false}
      // All slots visible at once — anything less creates a second,
      // independently-scrolling region nested inside the Drawer's own
      // ScrollArea, which fights the outer scroll gesture on touch.
      maxVisibleSlots={PROJECT_SLOTS.length}
      showTimestamp={false}
      layout="vertical"
    />
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
        <p className="mt-0.5 font-sans text-xs leading-relaxed text-muted-foreground">
          {item.description}
        </p>
        {item.images && item.images.length > 1 && (
          <Carousel className="mt-2 px-8">
            <CarouselContent>
              {item.images.map((image, index) => (
                <CarouselItem key={image + index}>
                  <img
                    src={image}
                    alt=""
                    loading="lazy"
                    className="aspect-video w-full border-y-4 border-foreground bg-background object-cover dark:border-ring"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        )}
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
          <p className="truncate text-xs font-bold tracking-wide uppercase">
            {employer.name}
          </p>
          <p className="truncate font-sans text-[11px] text-muted-foreground">
            {employer.role}
          </p>
        </div>
        {employer.period && (
          <span className="shrink-0 font-sans text-[11px] text-muted-foreground">
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

const WORK_LOG_TITLE = "Registro de Misiones & Proyectos"

/** Title bar — stays pinned above the scrollable body in both shells. */
function WorkLogHeader() {
  return (
    <header
      data-window-drag-handle
      className="flex cursor-move touch-none items-center border-b-4 border-border px-4 py-3 pr-12 select-none"
    >
      <h2 className="retro text-xs leading-snug">{WORK_LOG_TITLE}</h2>
    </header>
  )
}

/* Same hanging-flap recipe as the other micro-menu windows, and the same
   width-safe treatment as TalentsModal's tab strip below `md:` — equal-
   width flex-1 flaps with a truncate backstop instead of an unbounded
   `w-fit` that can run past the Drawer's right edge. */
function WorkLogTabsList() {
  return (
    <TabsList className="absolute -bottom-9 left-3 flex w-[calc(100%-1.5rem)] gap-1 md:w-fit">
      <TabsTrigger
        value="products"
        data-cuelume-toggle="page"
        className="min-w-0 flex-1 truncate text-[11px] md:flex-none md:text-sm"
      >
        PROYECTOS
      </TabsTrigger>
      <TabsTrigger
        value="trajectory"
        data-cuelume-toggle="page"
        className="min-w-0 flex-1 truncate text-[11px] md:flex-none md:text-sm"
      >
        EXPERIENCIA
      </TabsTrigger>
    </TabsList>
  )
}

/** The actual scrollable body — each shell wraps this in its own scrolling
 * container (a plain overflow-y-auto div on desktop, `ScrollArea` in the
 * mobile Drawer). */
function WorkLogTabsBody() {
  return (
    <>
      <TabsContent value="products" className="mt-0">
        <ProjectsTab />
      </TabsContent>
      <TabsContent value="trajectory" className="mt-0">
        <TrajectoryTab />
      </TabsContent>
    </>
  )
}

function handleWorkLogTabChange(value: string) {
  if (value === "trajectory") {
    useQuestStore.getState().completeObjectiveIfAccepted("review-experience")
  }
}

/** Everything the desktop window shell wraps — unchanged layout, just
 * composed from the header/tabs-list/body pieces above so the mobile
 * Drawer branch can recompose them around its own scrolling boundary. */
function WorkLogContent() {
  return (
    <>
      <WorkLogHeader />

      <Tabs
        defaultValue="products"
        className="min-h-0 flex-1 flex-col"
        onValueChange={handleWorkLogTabChange}
      >
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <WorkLogTabsBody />
        </div>

        <WorkLogTabsList />
      </Tabs>
    </>
  )
}

/**
 * Work Log — bound to the 'L' hotkey / micro-menu icon. Two tabs: personal
 * projects rendered as Save Slots (drilling into an in-place detail view),
 * and professional trajectory grouped by employer/client. Desktop keeps the
 * draggable window; mobile swaps in a bottom-sheet Drawer.
 */
export function WorkLogModal({ isOpen, onClose }: WorkLogModalProps) {
  const isMobile = useIsMobile()

  useEffect(() => {
    if (isOpen) play("ready")
  }, [isOpen])

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[85svh]">
          <DrawerTitle className="sr-only">{WORK_LOG_TITLE}</DrawerTitle>
          <div className="relative flex min-h-0 flex-1 flex-col pb-10">
            <DrawerClose asChild>
              <button
                type="button"
                aria-label="Cerrar ventana"
                className="absolute top-2 right-2 z-20 flex size-7 items-center justify-center border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
                data-cuelume-press
                data-cuelume-release
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </DrawerClose>

            <WorkLogHeader />

            <Tabs
              defaultValue="products"
              className="min-h-0 flex-1 flex-col"
              onValueChange={handleWorkLogTabChange}
            >
              <ScrollArea className="min-h-0 flex-1">
                <div className="p-4">
                  <WorkLogTabsBody />
                </div>
              </ScrollArea>

              <WorkLogTabsList />
            </Tabs>
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <WowDraggableWindow
      id="quests"
      isOpen={isOpen}
      onClose={onClose}
      className="h-[600px] w-[min(720px,calc(100svw-2rem))] max-h-[90svh]"
    >
      <WorkLogContent />
    </WowDraggableWindow>
  )
}
