import { BookOpen, ScrollText, Settings, Trophy, User, Users } from "lucide-react"

export const SECTIONS = [
  { id: "character", label: "Hoja de Personaje", hotkey: "c", icon: User },
  {
    id: "quests",
    label: "Registro de Misiones & Proyectos",
    hotkey: "l",
    icon: ScrollText,
  },
  { id: "spellbook", label: "Stack & Talentos", hotkey: "p", icon: BookOpen },
  { id: "achievements", label: "Logros & Hitos", hotkey: "y", icon: Trophy },
  { id: "social", label: "Redes & Contacto", hotkey: "j", icon: Users },
  { id: "settings", label: "Opciones", hotkey: "o", icon: Settings },
] as const

export type SectionId = (typeof SECTIONS)[number]["id"]

export const SECTION_IDS: readonly SectionId[] = SECTIONS.map(
  (section) => section.id
)

export interface ContactLink {
  name: string
  handle: string
  description: string
  href: string
  /** Public asset path for the link icon. */
  icon: string
}

// github-logo.png ships under /tech in this project; the rest live under /social.
export const CONTACT_LINKS: readonly ContactLink[] = [
  {
    name: "GitHub",
    handle: "github.com/erracode",
    description: "Explorador de Código & Open Source",
    href: "https://github.com/erracode",
    icon: "/tech/github-logo.png",
  },
  {
    name: "LinkedIn",
    handle: "linkedin.com/in/jesus-diaz-erracode",
    description: "Perfil Profesional",
    href: "https://www.linkedin.com/in/jesus-diaz-erracode",
    icon: "/social/linkedin-logo.png",
  },
  {
    name: "Email",
    handle: "jdiaz.97ma@gmail.com",
    description: "Contacto Directo",
    href: "mailto:jdiaz.97ma@gmail.com",
    icon: "/social/email-icon.svg",
  },
]
