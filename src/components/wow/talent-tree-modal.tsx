import { useEffect, useState } from "react"
import { play } from "cuelume"
import type { LucideIcon } from "lucide-react"
import {
  Box,
  Cloud,
  Container,
  Database,
  GitBranch,
  LayoutTemplate,
  Server,
  Shield,
  Terminal,
  Workflow,
} from "lucide-react"

import { Button } from "@/components/ui/8bit/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/8bit/dialog"
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
import { cn } from "@/lib/utils"

interface TalentTreeModalProps {
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

/** Shared by every spec — foundational tools, not spec-specific. */
const CORE_CHAIN: TalentNodeData[] = [
  {
    id: "git",
    name: "Git",
    description:
      "Control de versiones distribuido — la base de todo flujo de trabajo en equipo.",
    Icon: GitBranch,
  },
  {
    id: "docker",
    name: "Docker",
    description:
      "Contenedores para empaquetar y desplegar de forma reproducible.",
    Icon: Container,
  },
  {
    id: "typescript",
    name: "TypeScript",
    description: "Tipado estático sobre JavaScript — la base de todo el stack.",
    image: "/tech/typescript-logo.png",
  },
  {
    id: "linux",
    name: "Linux",
    description: "Línea de comandos y administración de servidores.",
    Icon: Terminal,
  },
  {
    id: "cicd",
    name: "CI/CD",
    description: "Integración y despliegue continuo — automatizar para no romper nada.",
    Icon: Workflow,
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
 * description. The background-image banner lives on the Talents tab
 * instead (see TalentsTab): that's where it reads at full width, per spec. */
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
 * Background art for the currently viewed spec sits directly behind the
 * tree — not a separate banner above it — matching WoW's talent window,
 * where the art fills the whole panel and nodes render on top of it.
 * Placeholder until real per-spec art replaces backgroundSrc. A darken
 * overlay keeps nodes/text legible regardless of what art goes there.
 */
function TalentsTab({ spec }: { spec: SpecDef }) {
  return (
    <div className="relative h-full overflow-hidden border-y-6 border-foreground dark:border-ring">
      <img
        src="/placeholder.svg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ imageRendering: "pixelated" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-background/75"
      />

      <div className="relative grid grid-cols-2 gap-6 p-6">
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            Core
          </h3>
          <TalentChain nodes={CORE_CHAIN} />
        </div>
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            {spec.label}
          </h3>
          <TalentChain nodes={spec.chain} />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-inherit"
      />
    </div>
  )
}

/**
 * WoW-style "Talents & Specialization" window. Shares the pixel-bordered
 * dialog frame with NpcQuestDialog/CharacterPanelModal; "View Talent Trees"
 * drives the same controlled Tabs state the bottom tab strip uses, so both
 * paths land on the same place.
 */
export function TalentTreeModal({ isOpen, onClose }: TalentTreeModalProps) {
  const [activeTab, setActiveTab] = useState<TalentTab>("specialization")
  const [selectedSpec, setSelectedSpec] = useState<SpecId>("fullstack")

  useEffect(() => {
    if (isOpen) play("ready")
  }, [isOpen])

  const spec = SPECS[selectedSpec]

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="flex h-[min(680px,92svh)] flex-col gap-0 p-0 sm:max-w-5xl">
        <header className="flex items-center border-b-4 border-border px-4 py-3 pr-12">
          <DialogTitle className="text-xs leading-snug">
            Talentos y Especialización
          </DialogTitle>
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
                    View Talent Trees
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="talents" className="mt-0 h-full">
                <TalentsTab spec={spec} />
              </TabsContent>
            </div>
          </TooltipProvider>

          {/* Same hanging-flap recipe as CharacterPanelModal's tab strip. */}
          <TabsList className="absolute -bottom-9 left-3 w-fit">
            <TabsTrigger value="specialization" data-cuelume-toggle="page">
              Specialization
            </TabsTrigger>
            <TabsTrigger value="talents" data-cuelume-toggle="page">
              Talents
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
