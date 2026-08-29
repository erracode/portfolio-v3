import { useEffect } from "react"
import { play } from "cuelume"
import {
  Crown,
  GraduationCap,
  Landmark,
  Mic,
  Server,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/8bit/badge"
import { Drawer, DrawerClose, DrawerContent, DrawerTitle } from "@/components/ui/8bit/drawer"
import { ScrollArea } from "@/components/ui/8bit/scroll-area"
import { WowDraggableWindow } from "@/components/wow/wow-draggable-window"
import { useIsMobile } from "@/lib/use-is-mobile"

interface AchievementsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Achievement {
  id: string
  title: string
  description: string
  category: string
  icon: LucideIcon
}

/** Real career milestones only, sourced from the user's LinkedIn/resume PDF
 * — no fabricated certifications. If certifications exist, add them here. */
const ACHIEVEMENTS: Achievement[] = [
  {
    id: "degree",
    title: "Ingeniería en Computación",
    description: "Título de Ingeniero — Universidad Rafael Belloso Chacín (URBE).",
    category: "TITULACIÓN",
    icon: GraduationCap,
  },
  {
    id: "sundevs-leadership",
    title: "Senior Full-Stack Engineer en SunDevs",
    description: "Rol de liderazgo técnico en el ecosistema Cinemark LATAM.",
    category: "LIDERAZGO",
    icon: Crown,
  },
  {
    id: "antd-migration",
    title: "Migración Ant Design v3 → v5",
    description: "Modernización de sistemas legacy sin interrumpir la operación del negocio.",
    category: "ARQUITECTURA",
    icon: Wrench,
  },
  {
    id: "hb-reconciler",
    title: "Motor Financiero HB Reconciler",
    description: "Sistema de conciliación financiera desarrollado en Awsh.",
    category: "FINTECH",
    icon: Landmark,
  },
  {
    id: "hui",
    title: "Sistema HUI de Aprovisionamiento Automatizado",
    description: "Gestión de instancias de WordPress vía cPanel API/SSH.",
    category: "INFRAESTRUCTURA",
    icon: Server,
  },
  {
    id: "community-lead",
    title: "Lead de Comunidad / Speaker en SunDevs",
    description: "Organización y participación activa en la comunidad técnica interna.",
    category: "COMUNIDAD",
    icon: Mic,
  },
]

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const Icon = achievement.icon

  return (
    <div className="relative flex items-start gap-3 border-y-6 border-foreground bg-card p-3 dark:border-ring">
      <div className="relative flex size-10 shrink-0 items-center justify-center border-y-4 border-foreground bg-background dark:border-ring">
        <Icon
          className="size-5"
          style={{ color: "#ffd100" }}
          aria-hidden="true"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -mx-1 border-x-4 border-inherit"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-bold">{achievement.title}</p>
          <Badge
            variant="outline"
            font="normal"
            className="shrink-0 px-1.5 py-0.5 text-[8px]"
          >
            {achievement.category}
          </Badge>
        </div>
        <p className="mt-0.5 font-sans text-[10px] leading-relaxed text-muted-foreground">
          {achievement.description}
        </p>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-inherit"
      />
    </div>
  )
}

const ACHIEVEMENTS_TITLE = "Logros & Hitos"

/** Title bar — stays pinned above the scrollable body in both shells. */
function AchievementsHeader() {
  return (
    <header
      data-window-drag-handle
      className="flex cursor-move touch-none items-center border-b-4 border-border px-4 py-3 pr-12 select-none"
    >
      <h2 className="retro text-xs leading-snug">{ACHIEVEMENTS_TITLE}</h2>
    </header>
  )
}

/** The actual scrollable body — each shell wraps this in its own scrolling
 * container (a plain overflow-y-auto div on desktop, `ScrollArea` in the
 * mobile Drawer). */
function AchievementsBody() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {ACHIEVEMENTS.map((achievement) => (
        <AchievementCard key={achievement.id} achievement={achievement} />
      ))}
    </div>
  )
}

/** Everything the desktop window shell wraps — unchanged layout, just
 * composed from the header/body pieces above so the mobile Drawer branch
 * can recompose them around its own scrolling boundary. */
function AchievementsContent() {
  return (
    <>
      <AchievementsHeader />

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <AchievementsBody />
      </div>
    </>
  )
}

/**
 * WoW-style Achievements window — bound to the 'Y' hotkey / Logros
 * micro-menu icon. A grid of real career milestones tagged by category;
 * no fabricated certifications, only what's grounded in the resume. Desktop
 * keeps the draggable window; mobile swaps in a bottom-sheet Drawer.
 */
export function AchievementsModal({ isOpen, onClose }: AchievementsModalProps) {
  const isMobile = useIsMobile()

  useEffect(() => {
    if (isOpen) play("ready")
  }, [isOpen])

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[85svh]">
          <DrawerTitle className="sr-only">{ACHIEVEMENTS_TITLE}</DrawerTitle>
          <div className="relative flex min-h-0 flex-1 flex-col">
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

            <AchievementsHeader />

            <ScrollArea className="min-h-0 flex-1">
              <div className="p-4">
                <AchievementsBody />
              </div>
            </ScrollArea>
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <WowDraggableWindow
      id="achievements"
      isOpen={isOpen}
      onClose={onClose}
      className="h-[560px] w-[min(672px,calc(100svw-2rem))] max-h-[88svh]"
    >
      <AchievementsContent />
    </WowDraggableWindow>
  )
}
