import { useEffect } from "react"
import { play } from "cuelume"
import type { LucideIcon } from "lucide-react"
import { Download, Lock, X } from "lucide-react"

import { Avatar } from "@/components/ui/8bit/avatar"
import Timeline1, {
  type TimelineStep,
} from "@/components/ui/8bit/blocks/timeline1"
import { SpriteAnimation } from "@/components/wow/sprite-animation"
import { PLAYER_SPRITE } from "@/data/sprites"
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
import { Drawer, DrawerClose, DrawerContent, DrawerTitle } from "@/components/ui/8bit/drawer"
import { ScrollArea } from "@/components/ui/8bit/scroll-area"
import { WowDraggableWindow } from "@/components/wow/wow-draggable-window"
import { useLogStore } from "@/lib/log-store"
import { useQuestStore } from "@/lib/quest-store"
import { useIsMobile } from "@/lib/use-is-mobile"
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

/** Row height shared by both gear columns, the portrait, and the attributes
 * panel (4 slots x size-14 + 3 gaps) so the "Personaje" tab never needs to
 * scroll as a whole — only the attributes panel scrolls internally if its
 * bio text overflows this bound. */
const ROW_HEIGHT_PX = 260

const LEVEL_LABEL = "Lv. 6+ Senior Full-Stack Engineer"
const BIO_TEXT =
  "Ingeniero Full-Stack con foco en construir productos de punta a punta: interfaces en React/Next.js conectadas a APIs en Node.js, con PostgreSQL como fuente de datos. Cómodo moviéndose entre el navegador y el servidor sin perder de vista la experiencia del usuario."
const LEADERSHIP_TEXT =
  "Liderazgo técnico y mentoría: de Junior Developer a Web Coordinator en Studio73, y actualmente lead developer para el ecosistema Cinemark en SunDevs."

interface Attribute {
  label: string
  /** Self-assessed, 1-5 pips — flavor, not a literal metric. Tweak freely. */
  level: number
}

const ATTRIBUTES: Attribute[] = [
  { label: "Backend", level: 4 },
  { label: "Frontend", level: 4 },
  { label: "Arquitectura", level: 4 },
  { label: "Debugging", level: 4 },
]

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
 * for the compact tab layout — full detail lives in the Work Log ('L') and
 * the downloadable CV. */
const EXPERIENCE_TIMELINE: TimelineStep[] = [
  {
    icon: "23",
    title: "Senior Full-Stack Engineer",
    badge: "SunDevs Inc",
    description:
      "Ene 2023 – Presente · Colombia. Lead developer para el ecosistema Cinemark (LATAM): 3 frontends y 8 microservicios para 12 países.",
  },
  {
    icon: "21",
    title: "Senior Software Engineer",
    badge: "Awsh",
    description:
      "Feb 2021 – Presente · Estados Unidos. E-commerce regulado, conciliación financiera y scraping distribuido de +20.000 dominios.",
  },
  {
    icon: "21",
    title: "Web Coordinator",
    badge: "Studio73",
    description:
      "Ene 2021 – Ene 2023 · Panamá. Ascenso de Junior Developer a Coordinador Web; infraestructura cloud y desarrollo para múltiples clientes.",
  },
  {
    icon: "20",
    title: "Software Developer",
    badge: "Inverdata",
    description:
      "Feb 2020 – Mar 2021 · Maracaibo, Venezuela. Sistema POS en Java y aplicación de inventario en Django, ambos sobre PostgreSQL.",
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
      <TooltipContent side="top" font="normal" className="text-xs">
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

function AttributeRow({ attribute }: { attribute: Attribute }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="font-sans text-xs font-bold tracking-wide uppercase">
        {attribute.label}
      </span>
      <div className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={cn(
              "size-2",
              i < attribute.level ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>
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
          <h3 className="font-sans text-xs font-bold tracking-widest text-muted-foreground uppercase">
            Bio
          </h3>
          <p className="mt-1 font-sans text-xs leading-relaxed">{BIO_TEXT}</p>
        </div>

        <div>
          <h3 className="font-sans text-xs font-bold tracking-widest text-muted-foreground uppercase">
            Atributos
          </h3>
          <div className="mt-2 flex flex-col gap-1.5">
            {ATTRIBUTES.map((attribute) => (
              <AttributeRow key={attribute.label} attribute={attribute} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-sans text-xs font-bold tracking-widest text-muted-foreground uppercase">
            Liderazgo
          </h3>
          <p className="mt-1 font-sans text-xs leading-relaxed">
            {LEADERSHIP_TEXT}
          </p>
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
            frameCount={PLAYER_SPRITE.rows.idle.frameCount}
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
            onClick={() => {
              useLogStore.getState().addLog("loot", `Descargado: ${item.label}`)
              useQuestStore.getState().completeObjectiveIfAccepted("download-cv")
            }}
            className="flex items-center justify-between border-y-6 border-foreground bg-muted/30 px-3 py-2 transition-colors hover:bg-accent dark:border-ring"
            data-cuelume-press
            data-cuelume-release
          >
            <span className="flex items-center gap-2 text-xs">
              <Download className="size-4" aria-hidden="true" />
              {item.label}
            </span>
            <span className="text-xs font-bold text-primary uppercase">
              {item.lang}
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}

/** Portrait + title bar — stays pinned above the scrollable body in both
 * shells (desktop never scrolls it either; it lives outside the window's
 * one scrolling region). */
function CharacterSheetHeader() {
  return (
    <>
      {/* Portrait protrudes from the top-left border, same recipe as
          NpcQuestDialog: positioning lives on an external wrapper. Same
          idle sprite as the center viewport, just shrunk to avatar size. */}
      <div className="absolute -top-6 -left-6 z-10">
        <Avatar variant="default" className="size-14 bg-card">
          <SpriteAnimation
            src={PLAYER_SPRITE.src}
            frameWidth={PLAYER_SPRITE.frameWidth}
            frameHeight={PLAYER_SPRITE.frameHeight}
            frameCount={PLAYER_SPRITE.rows.idle.frameCount}
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
    </>
  )
}

/* Tab strip hangs as flaps below the window's own border — not flush
   inside it, not a full-width bar — matching the in-game Character /
   Reputation / Currency tabs. Absolutely positioned relative to the
   enclosing `Tabs` root, so it never scrolls with the body in either
   shell. */
function CharacterSheetTabsList() {
  return (
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
  )
}

/** The actual scrollable body — each shell wraps this in its own scrolling
 * container (a plain overflow-y-auto div on desktop, `ScrollArea` in the
 * mobile Drawer). */
function CharacterSheetTabsBody() {
  return (
    <>
      <TabsContent value="character" className="mt-0">
        <CharacterTab />
      </TabsContent>
      <TabsContent value="trajectory" className="mt-0">
        <TrajectoryTab />
      </TabsContent>
      <TabsContent value="downloads" className="mt-0">
        <DownloadsTab />
      </TabsContent>
    </>
  )
}

/** Everything the desktop window shell wraps — unchanged layout, just
 * composed from the header/tabs-list/body pieces above so the mobile
 * Drawer branch can recompose them around its own scrolling boundary. */
function CharacterSheetContent() {
  return (
    <>
      <CharacterSheetHeader />

      <Tabs defaultValue="character" className="min-h-0 flex-1 flex-col">
        {/* Fills the window's fixed height exactly, always — it stays the
            same size across every tab. "Personaje" fits inside it without
            scrolling; a longer tab like "Trayectoria" scrolls inside this
            same box instead of resizing the window. */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <CharacterSheetTabsBody />
        </div>

        <CharacterSheetTabsList />
      </Tabs>
    </>
  )
}

/**
 * WoW-style Character Sheet window — bound to the 'C' hotkey / micro-menu
 * icon. Desktop keeps the draggable/free-floating pixel-bordered dialog
 * (corner portrait, hanging tab flaps); mobile swaps the shell for a
 * bottom-sheet Drawer around the identical content.
 */
export function CharacterSheetModal({
  isOpen,
  onClose,
}: CharacterSheetModalProps) {
  const isMobile = useIsMobile()

  useEffect(() => {
    if (isOpen) play("ready")
  }, [isOpen])

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[85svh]">
          <DrawerTitle className="sr-only">{PLAYER_NAME}</DrawerTitle>
          <div className="relative flex min-h-0 flex-1 flex-col pt-8 pb-10">
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

            <CharacterSheetHeader />

            <Tabs defaultValue="character" className="min-h-0 flex-1 flex-col">
              <ScrollArea className="min-h-0 flex-1">
                <div className="p-4">
                  <CharacterSheetTabsBody />
                </div>
              </ScrollArea>

              <CharacterSheetTabsList />
            </Tabs>
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <WowDraggableWindow
      id="character"
      isOpen={isOpen}
      onClose={onClose}
      className="h-[420px] w-[min(672px,calc(100svw-2rem))] max-h-[85svh]"
    >
      <CharacterSheetContent />
    </WowDraggableWindow>
  )
}
