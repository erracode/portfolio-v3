import { useEffect } from "react"
import { play } from "cuelume"
import {
  Crown,
  GraduationCap,
  Landmark,
  Mic,
  Server,
  Wrench,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/8bit/badge"
import { WowDraggableWindow } from "@/components/wow/wow-draggable-window"

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

/**
 * WoW-style Achievements window — bound to the 'Y' hotkey / Logros
 * micro-menu icon. A grid of real career milestones tagged by category;
 * no fabricated certifications, only what's grounded in the resume.
 */
export function AchievementsModal({ isOpen, onClose }: AchievementsModalProps) {
  useEffect(() => {
    if (isOpen) play("ready")
  }, [isOpen])

  return (
    <WowDraggableWindow
      id="achievements"
      isOpen={isOpen}
      onClose={onClose}
      className="h-[560px] w-[min(672px,calc(100svw-2rem))] max-h-[88svh]"
    >
      <header
        data-window-drag-handle
        className="flex cursor-move touch-none items-center border-b-4 border-border px-4 py-3 pr-12 select-none"
      >
        <h2 className="retro text-xs leading-snug">Logros & Hitos</h2>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {ACHIEVEMENTS.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </div>
    </WowDraggableWindow>
  )
}
