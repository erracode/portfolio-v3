import { useEffect, useState } from "react"
import { play } from "cuelume"
import type { LucideIcon } from "lucide-react"
import {
  Activity,
  Box,
  Cloud,
  CloudCog,
  Container,
  Database,
  Flame,
  GitBranch,
  Kanban,
  LayoutTemplate,
  Rocket,
  Server,
  Shield,
  Smartphone,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/8bit/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/8bit/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/8bit/tooltip"
import { WowDraggableWindow } from "@/components/wow/wow-draggable-window"
import { cn } from "@/lib/utils"

interface TalentsModalProps {
  isOpen: boolean
  onClose: () => void
}

type SpecId = "frontend" | "backend" | "fullstack"
type TalentTab = "specialization" | "talents"

interface TalentNodeData {
  id: string
  name: string
  description: string
  image?: string
  Icon?: LucideIcon
}

interface SpecDef {
  id: SpecId
  label: string
  description: string
  badgeIcon: LucideIcon
  badgeColor: string
  /** The spec's branch of the talent tree — also previewed on its
   * Specialization card and rendered in full on the Talents tab. */
  chain: TalentNodeData[]
}

interface TalentBranch {
  id: string
  label: string
  nodes: TalentNodeData[]
}

/** Full stack as a 3-branch talent tree, grouped formally by category —
 * independent of the selected specialization above (that selector
 * highlights a focus area; this tree is the complete, honest toolset). */
const TALENT_BRANCHES: TalentBranch[] = [
  {
    id: "frontend",
    label: "Frontend",
    nodes: [
      {
        id: "branch-react",
        name: "React (17-19)",
        description: "Librería de componentes — la base de toda interfaz construida en este stack.",
        image: "/tech/react-logo.png",
      },
      {
        id: "branch-nextjs",
        name: "Next.js",
        description: "Framework full-stack sobre React: rutas, SSR y API routes.",
        image: "/tech/nextjs-logo.png",
      },
      {
        id: "branch-astro",
        name: "Astro",
        description: "Framework orientado a contenido con hidratación parcial, para landings de carga rápida.",
        Icon: Rocket,
      },
      {
        id: "branch-react-native",
        name: "React Native",
        description: "Aplicaciones móviles nativas con el mismo modelo de componentes de React.",
        Icon: Smartphone,
      },
      {
        id: "branch-typescript",
        name: "TypeScript",
        description: "Tipado estático sobre JavaScript en todo el stack.",
        image: "/tech/typescript-logo.png",
      },
      {
        id: "branch-zustand",
        name: "Zustand",
        description: "Manejo de estado minimalista basado en hooks.",
        image: "/tech/zustand-logo.png",
      },
      {
        id: "branch-redux",
        name: "Redux",
        description: "Manejo de estado predecible para aplicaciones complejas.",
        image: "/tech/redux-logo.png",
      },
      {
        id: "branch-ui-frameworks",
        name: "UI Frameworks",
        description: "Ant Design, Radix UI, shadcn/ui, Tailwind CSS, Three.js y GSAP.",
        Icon: LayoutTemplate,
      },
    ],
  },
  {
    id: "backend",
    label: "Backend & Systems",
    nodes: [
      {
        id: "branch-nodejs",
        name: "Node.js",
        description: "Runtime de JavaScript en el servidor.",
        image: "/tech/nodejs-logo.png",
      },
      {
        id: "branch-bun",
        name: "Bun",
        description: "Runtime y toolkit de JavaScript de alto rendimiento.",
        Icon: Zap,
      },
      {
        id: "branch-hono",
        name: "Hono",
        description: "Framework web ultraligero, ideal para edge runtimes.",
        Icon: Flame,
      },
      {
        id: "branch-nestjs",
        name: "NestJS",
        description: "Framework de Node.js con arquitectura modular inspirada en Angular.",
        image: "/tech/nestjs-logo.png",
      },
      {
        id: "branch-express",
        name: "Express",
        description: "Framework minimalista para APIs HTTP en Node.js.",
        image: "/tech/express-logo.png",
      },
      {
        id: "branch-supabase",
        name: "Supabase",
        description: "Backend-as-a-service sobre PostgreSQL: auth, storage y realtime.",
        image: "/tech/supabase-logo.png",
      },
      {
        id: "branch-cf-workers",
        name: "Cloudflare Workers",
        description: "Cómputo serverless en el edge, sin cold starts perceptibles.",
        Icon: CloudCog,
      },
      {
        id: "branch-postgres",
        name: "PostgreSQL",
        description: "Base de datos relacional — la fuente de verdad.",
        image: "/tech/postgres-logo.png",
      },
      {
        id: "branch-redis",
        name: "Redis",
        description: "Caché en memoria para velocidad y datos efímeros.",
        Icon: Database,
      },
    ],
  },
  {
    id: "devops",
    label: "DevOps & Workflow",
    nodes: [
      {
        id: "branch-aws",
        name: "AWS",
        description: "CodeArtifact, Lambda y API Gateway — infraestructura cloud en producción.",
        Icon: Cloud,
      },
      {
        id: "branch-azure-devops",
        name: "Azure DevOps",
        description: "Repos, pipelines y tableros de trabajo.",
        Icon: Workflow,
      },
      {
        id: "branch-bitbucket",
        name: "Bitbucket",
        description: "Control de versiones y revisión de código.",
        Icon: GitBranch,
      },
      {
        id: "branch-jira",
        name: "Jira",
        description: "Planificación y seguimiento de tareas en equipo.",
        Icon: Kanban,
      },
      {
        id: "branch-docker",
        name: "Docker",
        description: "Contenerización de servicios para entornos consistentes.",
        Icon: Container,
      },
      {
        id: "branch-opentelemetry",
        name: "OpenTelemetry",
        description: "Trazas y métricas para observabilidad en producción.",
        Icon: Activity,
      },
      {
        id: "branch-cpanel",
        name: "cPanel API/SSH",
        description: "Aprovisionamiento y administración remota de servidores.",
        Icon: Terminal,
      },
    ],
  },
]

const SPECS: Record<SpecId, SpecDef> = {
  frontend: {
    id: "frontend",
    label: "Frontend Specialist",
    description:
      "Interfaces rápidas, accesibles y con personalidad. React y Next.js como base, con incursiones en 3D.",
    badgeIcon: LayoutTemplate,
    badgeColor: "#38bdf8",
    chain: [
      {
        id: "react",
        name: "React",
        description: "Librería de componentes — la base de toda interfaz.",
        image: "/tech/react-logo.png",
      },
      {
        id: "nextjs",
        name: "Next.js",
        description: "Framework full-stack sobre React: rutas, SSR y API routes.",
        image: "/tech/nextjs-logo.png",
      },
      {
        id: "threejs",
        name: "Three.js",
        description: "Gráficos 3D en el navegador vía WebGL.",
        Icon: Box,
      },
    ],
  },
  backend: {
    id: "backend",
    label: "Backend & Systems Architect",
    description:
      "Sistemas robustos y escalables. APIs, bases de datos y la infraestructura que las sostiene.",
    badgeIcon: Server,
    badgeColor: "#4ade80",
    chain: [
      {
        id: "nodejs",
        name: "Node.js",
        description: "Runtime de JavaScript en el servidor.",
        image: "/tech/nodejs-logo.png",
      },
      {
        id: "postgres",
        name: "PostgreSQL",
        description: "Base de datos relacional — la fuente de verdad.",
        image: "/tech/postgres-logo.png",
      },
      {
        id: "redis",
        name: "Redis",
        description: "Caché en memoria para velocidad y datos efímeros.",
        Icon: Database,
      },
      {
        id: "aws",
        name: "AWS",
        description: "Infraestructura cloud y monitoreo en producción.",
        Icon: Cloud,
      },
    ],
  },
  fullstack: {
    id: "fullstack",
    label: "Full-Stack Engineer",
    description:
      "Punta a punta: del navegador al servidor, sin perder de vista la experiencia del usuario.",
    badgeIcon: Shield,
    badgeColor: "#c41f3b",
    chain: [
      {
        id: "react-fs",
        name: "React",
        description: "Librería de componentes — la base de toda interfaz.",
        image: "/tech/react-logo.png",
      },
      {
        id: "nodejs-fs",
        name: "Node.js",
        description: "Runtime de JavaScript en el servidor.",
        image: "/tech/nodejs-logo.png",
      },
      {
        id: "postgres-fs",
        name: "PostgreSQL",
        description: "Base de datos relacional — la fuente de verdad.",
        image: "/tech/postgres-logo.png",
      },
    ],
  },
}

/** Talent node: a pixel-framed icon box with a "metallic" (zinc) border to
 * read as distinct from plain gear slots, name, an always-"Unlocked" status
 * tag, and a hover tooltip with the full description. */
function TalentNode({ node }: { node: TalentNodeData }) {
  const Icon = node.Icon

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex flex-col items-center gap-1">
          <div
            className="relative size-12 border-y-6 border-zinc-400 bg-card dark:border-zinc-500"
            role="img"
            aria-label={node.name}
            data-cuelume-press="tick"
          >
            {node.image && (
              <img
                src={node.image}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-contain p-1.5"
              />
            )}
            {Icon && (
              <Icon
                className="absolute inset-0 m-auto size-5 text-foreground"
                aria-hidden="true"
              />
            )}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-inherit"
            />
          </div>
          <span className="max-w-16 text-center text-[9px] leading-tight font-bold">
            {node.name}
          </span>
          <span className="text-[8px] font-bold text-emerald-500 uppercase">
            Desbloqueado
          </span>
        </div>
      </TooltipTrigger>
      {/* font="normal" drops the retro/pixel font — long descriptions wrap
          one word per line in Press Start 2P, unreadable at tooltip size. */}
      <TooltipContent
        side="top"
        font="normal"
        className="max-w-52 flex-col items-start gap-1"
      >
        <p className="text-[11px] font-bold">{node.name}</p>
        <p className="text-[10px] leading-snug text-background/70">
          {node.description}
        </p>
      </TooltipContent>
    </Tooltip>
  )
}

/** A talent branch — nodes connected in sequence by a CSS line. Vertical by
 * default (used both on the compact spec-card preview and the full tree). */
function TalentChain({
  nodes,
  direction = "column",
}: {
  nodes: TalentNodeData[]
  direction?: "row" | "column"
}) {
  const isRow = direction === "row"

  return (
    <div className={cn("flex", isRow ? "flex-row items-start" : "flex-col items-center")}>
      {nodes.map((node, index) => (
        <div
          key={node.id}
          className={cn("flex items-center", isRow ? "flex-row" : "flex-col")}
        >
          {index > 0 && (
            <div
              aria-hidden="true"
              className={cn(
                "bg-primary/50",
                isRow ? "mt-6 h-0.5 w-4" : "h-4 w-0.5"
              )}
            />
          )}
          <TalentNode node={node} />
        </div>
      ))}
    </div>
  )
}

/** One bordered box, no seams to fight — badge header, connected chain,
 * description. The full stack breakdown lives on the other tab (StackTab). */
function SpecCard({
  spec,
  selected,
  onSelect,
}: {
  spec: SpecDef
  selected: boolean
  onSelect: () => void
}) {
  const Badge = spec.badgeIcon

  return (
    <button
      type="button"
      onClick={onSelect}
      // The border's own color carries the "selected" state — a ring drawn
      // outside an already-thick 6px pixel border barely read as different.
      // Colored per spec (its badgeColor), not a fixed color for all three.
      style={selected ? { borderColor: spec.badgeColor } : undefined}
      className="relative flex min-w-0 flex-col items-stretch gap-3 border-y-6 border-foreground bg-card p-3 text-left transition-colors dark:border-ring"
      data-cuelume-toggle="scan"
    >
      <div className="flex items-center gap-2 border-b-4 border-border pb-2">
        <Badge
          className="size-5 shrink-0"
          style={{ color: spec.badgeColor }}
          aria-hidden="true"
        />
        <span className="min-w-0 text-[10px] font-bold tracking-wide uppercase">
          {spec.label}
        </span>
        {selected && (
          <span
            className="ml-auto shrink-0 text-[9px] font-bold"
            style={{ color: spec.badgeColor }}
          >
            ACTIVA
          </span>
        )}
      </div>

      <TalentChain nodes={spec.chain} />

      <p className="font-sans text-[10px] leading-relaxed text-muted-foreground">
        {spec.description}
      </p>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-inherit"
      />
    </button>
  )
}

/**
 * Full stack grouped into three formal categories — independent of the
 * spec selected on the previous tab, since this is meant to read as a
 * complete, honest inventory rather than a per-role subset.
 */
function StackTab() {
  return (
    <div className="flex flex-col gap-4">
      {TALENT_BRANCHES.map((branch) => (
        <div
          key={branch.id}
          className="relative border-y-6 border-foreground bg-card p-3 dark:border-ring"
        >
          <h3 className="border-b-4 border-border pb-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            {branch.label}
          </h3>
          <div className="mt-3 overflow-x-auto pb-1">
            <TalentChain nodes={branch.nodes} direction="row" />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-inherit"
          />
        </div>
      ))}
    </div>
  )
}

/**
 * WoW-style "Talents & Specialization" window — bound to the 'P' hotkey /
 * Grimoire micro-menu icon. Draggable/free-floating like the rest of the
 * site's windows, but keeps the same pixel-bordered dialog layout (hanging
 * tab flaps) the other four micro-menu windows share; "View Talent Trees"
 * drives the same controlled Tabs state the bottom tab strip uses, so both
 * paths land on the same place.
 */
export function TalentsModal({ isOpen, onClose }: TalentsModalProps) {
  const [activeTab, setActiveTab] = useState<TalentTab>("specialization")
  const [selectedSpec, setSelectedSpec] = useState<SpecId>("fullstack")

  useEffect(() => {
    if (isOpen) play("ready")
  }, [isOpen])

  return (
    <WowDraggableWindow
      id="spellbook"
      isOpen={isOpen}
      onClose={onClose}
      className="h-[680px] w-[min(1024px,calc(100svw-2rem))] max-h-[92svh]"
    >
      <header
        data-window-drag-handle
        className="flex cursor-move touch-none items-center border-b-4 border-border px-4 py-3 pr-12 select-none"
      >
        <h2 className="retro text-xs leading-snug">STACK & TALENTOS</h2>
      </header>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TalentTab)}
        className="min-h-0 flex-1 flex-col"
      >
        <TooltipProvider delayDuration={150}>
          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-4">
            <TabsContent value="specialization" className="mt-0">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {(Object.keys(SPECS) as SpecId[]).map((id) => (
                  <SpecCard
                    key={id}
                    spec={SPECS[id]}
                    selected={selectedSpec === id}
                    onSelect={() => setSelectedSpec(id)}
                  />
                ))}
              </div>
              <div className="mt-4 flex justify-center">
                <Button
                  variant="default"
                  onClick={() => setActiveTab("talents")}
                  data-cuelume-press
                  data-cuelume-release
                >
                  Ver Stack Completo
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="talents" className="mt-0 h-full">
              <StackTab />
            </TabsContent>
          </div>
        </TooltipProvider>

        {/* Same hanging-flap recipe as CharacterSheetModal's tab strip. */}
        <TabsList className="absolute -bottom-9 left-3 w-fit">
          <TabsTrigger value="specialization" data-cuelume-toggle="page">
            Especialización
          </TabsTrigger>
          <TabsTrigger value="talents" data-cuelume-toggle="page">
            Stack & Talentos
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </WowDraggableWindow>
  )
}
