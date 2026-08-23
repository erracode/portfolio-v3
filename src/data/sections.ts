import { BookOpen, ScrollText, Trophy, User, Users } from "lucide-react"

export const SECTIONS = [
  { id: "character", label: "Hoja de personaje", hotkey: "c", icon: User },
  {
    id: "quests",
    label: "Registro de misiones",
    hotkey: "l",
    icon: ScrollText,
  },
  { id: "spellbook", label: "Grimorio", hotkey: "p", icon: BookOpen },
  { id: "achievements", label: "Logros", hotkey: "y", icon: Trophy },
  { id: "social", label: "Hermandad", hotkey: "j", icon: Users },
] as const

export type SectionId = (typeof SECTIONS)[number]["id"]

export const SECTION_IDS: readonly SectionId[] = SECTIONS.map(
  (section) => section.id
)

export interface SocialLink {
  name: string
  href: string
  /** Public asset path for the link icon. */
  icon: string
}

// github-logo.png ships under /tech in this project; the rest live under /social.
export const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    name: "GitHub",
    href: "https://github.com",
    icon: "/tech/github-logo.png",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    icon: "/social/linkedin-logo.png",
  },
  {
    name: "Email",
    href: "mailto:",
    icon: "/social/email-icon.svg",
  },
]
