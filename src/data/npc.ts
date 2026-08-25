export type NpcOptionType = "info" | "quest"

export interface NpcOption {
  type: NpcOptionType
  label: string
  /** Id of the quest OR info node this option points to. */
  refId: string
}

export interface NpcQuest {
  id: string
  title: string
  description: string
  objectives: string[]
  rewards: string[]
}

export interface NpcInfoNode {
  id: string
  title: string
  text: string
}

export interface NpcData {
  name: string
  title: string
  portraitUrl: string
  greeting: string
  options: NpcOption[]
  quests: NpcQuest[]
  infoNodes: NpcInfoNode[]
}

export const sampleNpc: NpcData = {
  name: "Guardián del Portfolio",
  title: "Guía del reino",
  portraitUrl: "/game/gopher-enemy.png",
  greeting:
    "¡Saludos, aventurero! Bienvenido a mi portfolio. Explora mis proyectos y descubre las misiones que he completado.",
  options: [
    { type: "info", label: "¿Quién eres?", refId: "lore" },
    { type: "quest", label: "Explorar Portafolio", refId: "explore" },
    { type: "quest", label: "Entregar: Descargar CV", refId: "cv" },
  ],
  quests: [
    {
      id: "explore",
      title: "Explorar Portafolio",
      description:
        "Recorre las zonas del portfolio y descubre los proyectos destacados y la experiencia acumulada.",
      objectives: [
        "Visita la zona de Proyectos",
        "Revisa al menos 3 proyectos",
        "Consulta la sección de Experiencia",
      ],
      rewards: ["+500 XP", "Logro: Explorador"],
    },
    {
      id: "cv",
      title: "Entregar: Descargar CV",
      description:
        "Has revisado los proyectos. Descarga el CV para llevarte la información completa.",
      objectives: ["Descargar Resume.pdf"],
      rewards: ["+250 XP", "Objeto: Resume.pdf"],
    },
  ],
  infoNodes: [
    {
      id: "lore",
      title: "Sobre mí",
      text: "Soy Jesús, Full-Stack Developer. Me apasiona construir productos web robustos con TypeScript, React y Node.js, y me encanta el diseño de interfaces con personalidad.",
    },
  ],
}
