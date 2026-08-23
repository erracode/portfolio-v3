import type { SectionId } from "@/data/sections"
import {
  SOCIAL_LINKS,
  type SocialLink as SocialLinkConfig,
} from "@/data/sections"

const SECTION_PLACEHOLDERS: Record<Exclude<SectionId, "social">, string> = {
  character: "Perfil, rol y estadísticas del desarrollador.",
  quests: "Proyectos y experiencia laboral por zona.",
  spellbook: "Stack completo de tecnologías y herramientas.",
  achievements: "Certificaciones e hitos de carrera.",
}

function SocialLinkRow({ link }: { link: SocialLinkConfig }) {
  const external = link.href.startsWith("https:")
  return (
    <a
      href={link.href}
      {...(external && { target: "_blank", rel: "noreferrer" })}
      className="flex items-center gap-3 border border-transparent px-2 py-1.5 text-sm transition-colors hover:border-border hover:bg-accent"
    >
      <img
        src={link.icon}
        alt=""
        loading="lazy"
        className="size-5 object-contain"
      />
      <span>{link.name}</span>
    </a>
  )
}

/** Body registry per section. Keeps React nodes out of the windows store. */
export function SectionContent({ id }: { id: SectionId }) {
  if (id === "social") {
    return (
      <ul className="flex flex-col gap-1">
        {SOCIAL_LINKS.map((link) => (
          <li key={link.name}>
            <SocialLinkRow link={link} />
          </li>
        ))}
      </ul>
    )
  }
  return (
    <p className="text-sm text-muted-foreground">{SECTION_PLACEHOLDERS[id]}</p>
  )
}
