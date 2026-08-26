import { useEffect } from "react"
import { play } from "cuelume"
import { Building2, Circle, CircleCheck, ScrollText } from "lucide-react"

import { WowDraggableWindow } from "@/components/wow/wow-draggable-window"

interface QuestLogModalProps {
  isOpen: boolean
  onClose: () => void
}

type QuestState = "active" | "completed"

interface QuestEntry {
  id: string
  title: string
  status: QuestState
  description: string
  image?: string
}

interface ZoneEntry {
  id: string
  name: string
  status: QuestState
  period: string
  logo?: string
  quests: QuestEntry[]
}

/** Zones = employers, quests = the concrete projects/deliverables inside
 * each one — sourced from the user's LinkedIn/resume PDF. A zone reads
 * "En curso" while the role is current (SunDevs, Awsh); its individual
 * quests are still marked completed since those are shipped deliverables. */
const ZONES: ZoneEntry[] = [
  {
    id: "sundevs",
    name: "SunDevs Inc",
    status: "active",
    period: "Ene 2023 – Presente",
    logo: "/companies/sundevs-logo.png",
    quests: [
      {
        id: "cinemark",
        title: "Ecosistema Cinemark",
        status: "completed",
        description:
          "Frontends en Next.js y microservicios para la cadena de cines líder de LATAM.",
      },
      {
        id: "delivery-template",
        title: "Universal Delivery Template",
        status: "completed",
        description:
          "Plantilla en Markdown que estandariza el hand-off entre Ingeniería, QA y Producto.",
      },
      {
        id: "point-party",
        title: "Point Party",
        status: "completed",
        description: "Herramienta de estimación ágil adoptada por múltiples equipos.",
        image: "/projects/point-party-1.png",
      },
      {
        id: "antd-migration",
        title: "Migración Ant Design v3 → v5",
        status: "completed",
        description: "Modernización de plataformas backoffice regionales.",
      },
    ],
  },
  {
    id: "awsh",
    name: "Awsh",
    status: "active",
    period: "Feb 2021 – Presente",
    logo: "/companies/awsh-logo.jpg",
    quests: [
      {
        id: "ecommerce",
        title: "E-commerce de Armas de Fuego",
        status: "completed",
        description:
          "Pricing dinámico, regulaciones por estado e integración con Authorize.net.",
        image: "/projects/awsh-ecommerce-1.png",
      },
      {
        id: "scraper",
        title: "Web Scraping (+20.000 dominios)",
        status: "completed",
        description: "Sistema de cron jobs en tiempo real con Agenda.js.",
        image: "/projects/bot-scraper-1.png",
      },
      {
        id: "hui",
        title: "HUI — Provisión de WordPress",
        status: "completed",
        description: "Administra instancias WordPress vía CPanel API/SSH.",
        image: "/projects/hui-wordpress-1.png",
      },
      {
        id: "reconciler",
        title: "HB Reconciler",
        status: "completed",
        description:
          "Centraliza transacciones de Zoho CRM, NMI y Paytrace para facturación automática.",
        image: "/projects/app-reconciler-1.png",
      },
    ],
  },
  {
    id: "studio73",
    name: "Studio73",
    status: "completed",
    period: "Ene 2021 – Ene 2023",
    logo: "/companies/studio-logo.png",
    quests: [
      {
        id: "coordination",
        title: "De Junior a Coordinador Web",
        status: "completed",
        description: "Liderazgo del departamento web y optimización de flujos de entrega.",
        image: "/projects/studio73-1.png",
      },
      {
        id: "clients",
        title: "Gestión de Clientes (Panama Leagues, LPK)",
        status: "completed",
        description: "Punto de contacto técnico y gestión de infraestructura cloud.",
      },
    ],
  },
  {
    id: "everythingwebsites",
    name: "Everythingwebsites",
    status: "completed",
    period: "Ago 2022 – Nov 2022",
    logo: "/companies/everythingwebsites-logo.png",
    quests: [
      {
        id: "rebuild",
        title: "Reconstrucción del Sitio Insignia",
        status: "completed",
        description: "Rebuild completo a partir de diseños de alta fidelidad en Adobe XD.",
        image: "/projects/everything-websites-1.png",
      },
    ],
  },
  {
    id: "eduqueo",
    name: "Eduqueo",
    status: "completed",
    period: "Abr 2022 – Jun 2022",
    logo: "/companies/eduqueo-logo.png",
    quests: [
      {
        id: "whatsapp-api",
        title: "API de Mensajería Automatizada",
        status: "completed",
        description: "Infraestructura Node.js/MySQL para WhatsApp vía Tasker y Airtable.",
      },
    ],
  },
  {
    id: "inverdata",
    name: "Inverdata",
    status: "completed",
    period: "Feb 2020 – Mar 2021",
    quests: [
      {
        id: "pos",
        title: "Sistema POS (Java)",
        status: "completed",
        description: "Punto de venta con PostgreSQL para manejo robusto de datos.",
      },
      {
        id: "inventory",
        title: "App de Inventario (Django)",
        status: "completed",
        description: "Gestión de inventario para los departamentos de Ingeniería y Diseño.",
      },
    ],
  },
]

function QuestStatusTag({ status }: { status: QuestState }) {
  return status === "completed" ? (
    <span className="flex shrink-0 items-center gap-1 text-[9px] font-bold text-emerald-500 uppercase">
      <CircleCheck className="size-3" aria-hidden="true" />
      Completada
    </span>
  ) : (
    <span className="flex shrink-0 items-center gap-1 text-[9px] font-bold text-amber-400 uppercase">
      <Circle className="size-3" aria-hidden="true" />
      En curso
    </span>
  )
}

function QuestRow({ quest }: { quest: QuestEntry }) {
  return (
    <div className="flex items-start gap-3 border-b-2 border-dashed border-border py-2 last:border-b-0">
      <div className="relative size-10 shrink-0 border-y-4 border-foreground bg-background dark:border-ring">
        {quest.image ? (
          <img
            src={quest.image}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <ScrollText
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
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <p className="text-xs font-bold">{quest.title}</p>
          <QuestStatusTag status={quest.status} />
        </div>
        <p className="mt-0.5 font-sans text-[10px] leading-relaxed text-muted-foreground">
          {quest.description}
        </p>
      </div>
    </div>
  )
}

function ZoneSection({ zone }: { zone: ZoneEntry }) {
  return (
    <section className="relative border-y-6 border-foreground bg-card dark:border-ring">
      <header className="flex flex-wrap items-center gap-2 border-b-4 border-border px-3 py-2">
        {zone.logo ? (
          <img
            src={zone.logo}
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
        <span className="min-w-0 flex-1 truncate text-[10px] font-bold tracking-wide uppercase">
          {zone.name}
        </span>
        <span className="shrink-0 font-sans text-[9px] text-muted-foreground">
          {zone.period}
        </span>
        <QuestStatusTag status={zone.status} />
      </header>

      <div className="px-3">
        {zone.quests.map((quest) => (
          <QuestRow key={quest.id} quest={quest} />
        ))}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-inherit"
      />
    </section>
  )
}

/**
 * WoW-style Quest Log — bound to the 'L' hotkey / Registro micro-menu icon.
 * Zones (employers) grouped top to bottom, each with its own quests
 * (projects/deliverables). No tabs: a single scrollable list, closer to the
 * in-game quest log's zone-grouped tree than a tabbed sheet.
 */
export function QuestLogModal({ isOpen, onClose }: QuestLogModalProps) {
  useEffect(() => {
    if (isOpen) play("ready")
  }, [isOpen])

  return (
    <WowDraggableWindow
      id="quests"
      isOpen={isOpen}
      onClose={onClose}
      className="h-[560px] w-[min(672px,calc(100svw-2rem))] max-h-[88svh]"
    >
      <header
        data-window-drag-handle
        className="flex cursor-move touch-none items-center border-b-4 border-border px-4 py-3 pr-12 select-none"
      >
        <h2 className="retro text-xs leading-snug">Registro de Misiones</h2>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <p className="mb-3 font-sans text-[10px] text-muted-foreground">
          Misiones activas y completadas, organizadas por zona de proyecto.
        </p>
        <div className="flex flex-col gap-4">
          {ZONES.map((zone) => (
            <ZoneSection key={zone.id} zone={zone} />
          ))}
        </div>
      </div>
    </WowDraggableWindow>
  )
}
