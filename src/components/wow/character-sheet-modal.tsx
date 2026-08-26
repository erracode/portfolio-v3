import { useEffect } from "react"
import { play } from "cuelume"
import type { LucideIcon } from "lucide-react"
import { Download, Lock } from "lucide-react"

import { Avatar } from "@/components/ui/8bit/avatar"
import Timeline1, {
  type TimelineStep,
} from "@/components/ui/8bit/blocks/timeline1"
import { SpriteAnimation } from "@/components/wow/sprite-animation"
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
import { useLogStore } from "@/lib/log-store"
import { cn } from "@/lib/utils"

interface CharacterSheetModalProps {
  isOpen: boolean
  onClose: () => void
}

interface GearItem {
  name: string
  image?: string
  Icon?: LucideIcon
}

const PLAYER_NAME = "Jesús Díaz"

/** Idle strip: top row only (6 of the sheet's 12 frames) — the bottom row
 * is a walk cycle, out of scope for a standing character-sheet view. */
const PLAYER_SPRITE = {
  src: "/game/player.png",
  frameWidth: 250,
  frameHeight: 250,
  frameCount: 6,
  sheetWidth: 1500,
  sheetHeight: 500,
}

/** Row height shared by both gear columns, the portrait, and the attributes
 * panel (4 slots x size-14 + 3 gaps) so the "Personaje" tab never needs to
 * scroll as a whole — only the attributes panel scrolls internally if its
 * bio text overflows this bound. */
const ROW_HEIGHT_PX = 260

const LEVEL_LABEL = "Lv. 6+ Senior Full-Stack Engineer"
const BIO_TEXT =
  "Ingeniero Full-Stack con foco en construir productos de punta a punta: interfaces en React/Next.js conectadas a APIs en Node.js, con PostgreSQL como fuente de datos. Cómodo moviéndose entre el navegador y el servidor sin perder de vista la experiencia del usuario."

/** Every gear slot starts empty on purpose — a placeholder grid to fill in
 * later (equipment/spec assignment now lives conceptually in TalentsModal). */
const GEAR_SLOT_LABELS = [
  "Cabeza",
  "Hombros",
  "Pecho",
  "Manos",
  "Mano principal",
  "Mano secundaria",
  "Objeto 1",
  "Objeto 2",
] as const

/** Sourced from the user's LinkedIn/resume PDF, condensed to one line each
 * for the compact tab layout — full detail lives in the downloadable CV. */
const EXPERIENCE_TIMELINE: TimelineStep[] = [
  {
    icon: "23",
    title: "Software Engineer II",
    badge: "SunDevs Inc",
    description:
      "Ene 2023 – Presente · Colombia. Full-stack lead en el ecosistema Cinemark (cadena de cines líder en LATAM): Next.js, microservicios, ADRs y migración de sistemas legacy.",
  },
  {
    icon: "21",
    title: "Software Engineer",
    badge: "Awsh",
    description:
      "Feb 2021 – Presente · Estados Unidos. E-commerce y fintech con Next.js y PayloadCMS, scraping masivo de +20.000 dominios con Agenda.js y herramientas de conciliación financiera.",
  },
  {
    icon: "21",
    title: "Software Developer Coordinator",
    badge: "Studio73",
    description:
      "Ene 2021 – Ene 2023 · Panamá. Promovido de Junior a Coordinador Web; punto de contacto técnico para marcas como Panama Leagues y LPK, gestión de infraestructura cloud.",
  },
  {
    icon: "22",
    title: "Ingeniero de Software Freelance",
    badge: "Everythingwebsites",
    description:
      "Ago 2022 – Nov 2022 · Sacramento, CA. Reconstrucción completa del sitio insignia de la compañía a partir de diseños en Adobe XD; soluciones WordPress a medida enfocadas en performance y SEO.",
  },
  {
    icon: "22",
    title: "Back End Developer",
    badge: "Eduqueo",
    description:
      "Abr 2022 – Jun 2022 · Argentina. API en Node.js/MySQL para mensajería automatizada por WhatsApp (Tasker + Airtable) y sincronización de leads en tiempo real con el CRM.",
  },
  {
    icon: "20",
    title: "Software Developer",
    badge: "Inverdata",
    description:
      "Feb 2020 – Mar 2021 · Maracaibo, Venezuela. Sistema POS en Java y app de inventario en Django, ambos sobre PostgreSQL; soporte de infraestructura remota para Ingeniería y Diseño.",
  },
  {
    icon: "🎓",
    title: "Ingeniería en Computación",
    badge: "URBE",
    description:
      "2015 – 2020. Universidad Rafael Belloso Chacín — título de Ingeniero, mención Ingeniería en Computación.",
  },
]

/** Paths are a convention, not a guarantee — drop the actual PDFs at these
 * exact public/ locations for the buttons below to serve real files. */
const CV_DOWNLOADS = [
  { lang: "ES", label: "CV — Español", href: "/cv/jesus-diaz-cv-es.pdf" },
  { lang: "EN", label: "CV — English", href: "/cv/jesus-diaz-cv-en.pdf" },
] as const

/** Pixel-frame item slot, reusing the border recipe from BuffBar's SkillIcon. */
function GearSlotBox({ item, label }: { item?: GearItem; label: string }) {
  const Icon = item?.Icon

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "relative size-14 border-y-6 border-foreground bg-card dark:border-ring",
            !item && "opacity-40"
          )}
          role="img"
          aria-label={item ? item.name : `${label} — slot vacío`}
          data-cuelume-press="tick"
        >
          {item?.image && (
            <img
              src={item.image}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-contain p-2"
            />
          )}
          {Icon && (
            <Icon
              className="absolute inset-0 m-auto size-6 text-foreground"
              aria-hidden="true"
            />
          )}
          {!item && (
            <Lock
              className="absolute inset-0 m-auto size-4 text-muted-foreground"
              aria-hidden="true"
            />
          )}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-inherit"
          />
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" font="normal" className="text-[10px]">
        {item ? item.name : "Slot vacío — próximamente"}
      </TooltipContent>
    </Tooltip>
  )
}

function GearColumn({ labels }: { labels: readonly string[] }) {
  return (
    <div className="flex flex-row justify-center gap-3 sm:flex-col sm:justify-center">
      {labels.map((label) => (
        <GearSlotBox key={label} label={label} />
      ))}
    </div>
  )
}

function AttributesPanel() {
  return (
    <div className="relative border-y-6 border-foreground bg-card dark:border-ring">
      {/* Only this inner region scrolls (bounded to ROW_HEIGHT_PX) — the
          gear columns and portrait never need to. */}
      <div
        className="flex flex-col gap-3 overflow-y-auto p-3"
        style={{ maxHeight: ROW_HEIGHT_PX }}
      >
        <p
          className="text-center font-sans text-xs font-bold tracking-wide uppercase"
          style={{ color: "#ffd100" }}
        >
          {LEVEL_LABEL}
        </p>

        <div>
          <h3 className="font-sans text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            Bio
          </h3>
          <p className="mt-1 font-sans text-xs leading-relaxed">{BIO_TEXT}</p>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-inherit"
      />
    </div>
  )
}

function CharacterTab() {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_14rem]">
        <GearColumn labels={GEAR_SLOT_LABELS.slice(0, 4)} />

        <div
          className="relative order-first flex items-center justify-center border-y-6 border-foreground bg-muted/30 sm:order-none dark:border-ring"
          style={{ height: ROW_HEIGHT_PX }}
        >
          <SpriteAnimation
            src={PLAYER_SPRITE.src}
            frameWidth={PLAYER_SPRITE.frameWidth}
            frameHeight={PLAYER_SPRITE.frameHeight}
            frameCount={PLAYER_SPRITE.frameCount}
            sheetWidth={PLAYER_SPRITE.sheetWidth}
            sheetHeight={PLAYER_SPRITE.sheetHeight}
            fps={2}
            aria-label={`${PLAYER_NAME} — personaje`}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-inherit"
          />
        </div>

        <GearColumn labels={GEAR_SLOT_LABELS.slice(4)} />

        <AttributesPanel />
      </div>
    </TooltipProvider>
  )
}

function TrajectoryTab() {
  return (
    // Timeline1 hardcodes the retro/pixel font on its own <p> description —
    // no font prop to opt out, so this scoped, !important override is the
    // only way to make long sentences readable instead of wrapping
    // one word per line.
    <div className="[&_p.retro]:font-sans!">
      <Timeline1
        title=""
        description=""
        steps={EXPERIENCE_TIMELINE}
        className="px-0 py-0"
      />
    </div>
  )
}

function DownloadsTab() {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-sans text-xs text-muted-foreground">
        Descarga el currículum completo en el idioma que prefieras.
      </p>
      <div className="flex flex-col gap-2">
        {CV_DOWNLOADS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            download
            onClick={() =>
              useLogStore.getState().addLog("loot", `Descargado: ${item.label}`)
            }
            className="flex items-center justify-between border-y-6 border-foreground bg-muted/30 px-3 py-2 transition-colors hover:bg-accent dark:border-ring"
            data-cuelume-press
            data-cuelume-release
          >
            <span className="flex items-center gap-2 text-xs">
              <Download className="size-4" aria-hidden="true" />
              {item.label}
            </span>
            <span className="text-[10px] font-bold text-primary uppercase">
              {item.lang}
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}

/**
 * WoW-style Character Sheet window — bound to the 'C' hotkey / micro-menu
 * icon. Draggable/free-floating like the rest of the site's windows, but
 * keeps the same pixel-bordered dialog layout (corner portrait, hanging
 * tab flaps) the other four micro-menu windows share.
 */
export function CharacterSheetModal({
  isOpen,
  onClose,
}: CharacterSheetModalProps) {
  useEffect(() => {
    if (isOpen) play("ready")
  }, [isOpen])

  return (
    <WowDraggableWindow
      id="character"
      isOpen={isOpen}
      onClose={onClose}
      className="h-[420px] w-[min(672px,calc(100svw-2rem))] max-h-[85svh]"
    >
      {/* Portrait protrudes from the top-left border, same recipe as
          NpcQuestDialog: positioning lives on an external wrapper. Same
          idle sprite as the center viewport, just shrunk to avatar size. */}
      <div className="absolute -top-6 -left-6 z-10">
        <Avatar variant="default" className="size-14 bg-card">
          <SpriteAnimation
            src={PLAYER_SPRITE.src}
            frameWidth={PLAYER_SPRITE.frameWidth}
            frameHeight={PLAYER_SPRITE.frameHeight}
            frameCount={PLAYER_SPRITE.frameCount}
            sheetWidth={PLAYER_SPRITE.sheetWidth}
            sheetHeight={PLAYER_SPRITE.sheetHeight}
            fps={2}
            scale={56 / PLAYER_SPRITE.frameWidth}
            aria-label={`${PLAYER_NAME} — retrato`}
          />
        </Avatar>
      </div>

      <header
        data-window-drag-handle
        className="flex cursor-move touch-none items-center border-b-4 border-border py-3 pr-12 pl-16 select-none"
      >
        <h2 className="retro min-w-0 flex-1 truncate text-xs leading-snug">
          {PLAYER_NAME}
        </h2>
      </header>

      <Tabs defaultValue="character" className="min-h-0 flex-1 flex-col">
        {/* Fills the window's fixed height exactly, always — it stays the
            same size across every tab. "Personaje" fits inside it without
            scrolling; a longer tab like "Trayectoria" scrolls inside this
            same box instead of resizing the window. */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <TabsContent value="character" className="mt-0">
            <CharacterTab />
          </TabsContent>
          <TabsContent value="trajectory" className="mt-0">
            <TrajectoryTab />
          </TabsContent>
          <TabsContent value="downloads" className="mt-0">
            <DownloadsTab />
          </TabsContent>
        </div>

        {/* Tab strip hangs as flaps below the window's own border — not
            flush inside it, not a full-width bar — matching the in-game
            Character / Reputation / Currency tabs. */}
        <TabsList className="absolute -bottom-9 left-3 w-fit">
          <TabsTrigger value="character" data-cuelume-toggle="page">
            Personaje
          </TabsTrigger>
          <TabsTrigger value="trajectory" data-cuelume-toggle="page">
            Trayectoria
          </TabsTrigger>
          <TabsTrigger value="downloads" data-cuelume-toggle="page">
            Descargas
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </WowDraggableWindow>
  )
}
