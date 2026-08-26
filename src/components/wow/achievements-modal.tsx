import { useEffect } from "react"
import { play } from "cuelume"
import {
  Cpu,
  GraduationCap,
  PartyPopper,
  Rocket,
  Trophy,
  Wrench,
  type LucideIcon,
} from "lucide-react"

import { WowDraggableWindow } from "@/components/wow/wow-draggable-window"

interface AchievementsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Achievement {
  id: string
  title: string
  description: string
  /** Flavor points, WoW-achievement-style — not a real-world credential or
   * metric, just a game score for a career milestone. */
  points: number
  icon: LucideIcon
}

/** Real career milestones only, sourced from the user's LinkedIn/resume PDF
 * — no fabricated certifications. If certifications exist, add them here. */
const ACHIEVEMENTS: Achievement[] = [
  {
    id: "degree",
    title: "Ingeniería en Computación",
    description:
      "Título de Ingeniero — Universidad Rafael Belloso Chacín (2015–2020).",
    points: 50,
    icon: GraduationCap,
  },
  {
    id: "sundevs-promotion",
    title: "Software Engineer II",
    description:
      "Ascenso en SunDevs, liderando features críticas para el ecosistema Cinemark.",
    points: 30,
    icon: Trophy,
  },
  {
    id: "studio73-promotion",
    title: "De Junior a Coordinador Web",
    description: "Ascenso en Studio73, al frente del departamento web.",
    points: 25,
    icon: Trophy,
  },
  {
    id: "point-party",
    title: "Point Party",
    description:
      "Herramienta de estimación ágil adoptada por múltiples equipos en SunDevs.",
    points: 25,
    icon: Rocket,
  },
  {
    id: "antd-migration",
    title: "Migración Ant Design v3 → v5",
    description: "Modernización de sistemas legacy sin interrumpir el negocio.",
    points: 20,
    icon: Wrench,
  },
  {
    id: "scraper-scale",
    title: "+20.000 Dominios Procesados",
    description: "Sistema de web scraping a gran escala con Agenda.js.",
    points: 20,
    icon: Cpu,
  },
  {
    id: "santa",
    title: "'Dad SunDevs'",
    description: "Santa honorario en los eventos comunitarios del equipo.",
    points: 10,
    icon: PartyPopper,
  },
]

const TOTAL_POINTS = ACHIEVEMENTS.reduce((sum, item) => sum + item.points, 0)

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
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold">{achievement.title}</p>
          <span
            className="shrink-0 text-[10px] font-bold"
            style={{ color: "#ffd100" }}
          >
            +{achievement.points}
          </span>
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
 * micro-menu icon. A points-totaled grid of career milestones; no
 * fabricated certifications, only what's grounded in the resume.
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
        className="flex cursor-move touch-none items-center justify-between gap-2 border-b-4 border-border px-4 py-3 pr-12 select-none"
      >
        <h2 className="retro text-xs leading-snug">Logros</h2>
        <span
          className="flex shrink-0 items-center gap-1.5 text-[10px] font-bold"
          style={{ color: "#ffd100" }}
        >
          <Trophy className="size-3.5" aria-hidden="true" />
          {TOTAL_POINTS} PTS
        </span>
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
