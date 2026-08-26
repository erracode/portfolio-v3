import { useEffect, useState } from "react"
import { play } from "cuelume"
import {
  Building2,
  ExternalLink,
  Layers,
  MapPin,
  Search,
  Store,
  TrendingUp,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/8bit/dialog"
import { SaveSlots, type SaveSlot } from "@/components/ui/8bit/blocks/save-slots"
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
    images: ["/placeholder.svg"],
    icon: Store,
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
    images: ["/placeholder.svg"],
    icon: MapPin,
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
    images: ["/placeholder.svg"],
    icon: TrendingUp,
  },
  {
    id: "story-point-poker",
    name: "Story Point Poker",
    domain: "story-point-poker-react.pages.dev",
    liveUrl: "https://story-point-poker-react.pages.dev",
    category: "Herramienta Interna",
    summary:
      "Herramienta de estimación ágil (planning poker) adoptada internamente por equipos de ingeniería.",
    architecture:
      "SPA en React + TypeScript con componentes de Radix UI, sin backend propio: la sincronización de sesiones se resuelve completamente en el cliente. Adoptada como herramienta de facto en ceremonias de estimación de varios equipos.",
    stack: ["React", "TypeScript", "Radix UI"],
    images: ["/placeholder.svg"],
    icon: Layers,
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
]

const PROJECT_SLOTS: SaveSlot[] = PROJECTS.map((project) => ({
  id: project.id,
  isEmpty: false,
  name: project.name,
  description: project.category,
}))

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
          "Gran Fondo (granfondo.probidsida.org), Grupo Romarin (gruporomarin.com) y Legal Food Panama (legalfoodpa.com).",
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
        id: "kaironyx",
        title: "Kaironyx Labs",
        description: "kaironyx-labs-landing.pages.dev.",
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
        id: "erracode",
        title: "ErraCode",
        description: "erracode.pages.dev.",
      },
    ],
  },
]

function ProjectDetailModal({
  project,
  onClose,
}: {
  project: ProjectEntry | null
  onClose: () => void
}) {
  return (
    <Dialog
      open={project !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-h-[85svh] w-[min(640px,calc(100svw-2rem))] overflow-y-auto">
        {project && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 pr-6 text-xs leading-snug">
                <project.icon
                  className="size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                {project.name}
              </DialogTitle>
            </DialogHeader>

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

            <p className="font-sans text-[10px] leading-relaxed text-muted-foreground">
              {project.architecture}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {project.stack.map((tech) => (
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

            {project.liveUrl && (
              <Button asChild size="sm" className="w-fit">
                <a href={project.liveUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                  Visitar Proyecto
                </a>
              </Button>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ProjectsTab({
  onSelectProject,
}: {
  onSelectProject: (project: ProjectEntry) => void
}) {
  const handleSlotClick = (slot: SaveSlot) => {
    const project = PROJECTS.find((entry) => entry.id === slot.id)
    if (project) onSelectProject(project)
  }

  return (
    <SaveSlots
      slots={PROJECT_SLOTS}
      onSlotClick={handleSlotClick}
      title=""
      maxVisibleSlots={5}
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
 * projects rendered as Save Slots (drilling into ProjectDetailModal), and
 * professional trajectory grouped by employer/client.
 */
export function WorkLogModal({ isOpen, onClose }: WorkLogModalProps) {
  const [detailProject, setDetailProject] = useState<ProjectEntry | null>(null)

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
            <ProjectsTab onSelectProject={setDetailProject} />
          </TabsContent>
          <TabsContent value="trajectory" className="mt-0">
            <TrajectoryTab />
          </TabsContent>
        </div>

        {/* Same hanging-flap recipe as the other micro-menu windows. */}
        <TabsList className="absolute -bottom-9 left-3 w-fit">
          <TabsTrigger value="products" data-cuelume-toggle="page">
            PROYECTOS
          </TabsTrigger>
          <TabsTrigger value="trajectory" data-cuelume-toggle="page">
            EXPERIENCIA
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <ProjectDetailModal
        project={detailProject}
        onClose={() => setDetailProject(null)}
      />
    </WowDraggableWindow>
  )
}
