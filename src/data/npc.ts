export type NpcOptionType = "info" | "quest"

export interface NpcOption {
  type: NpcOptionType
  label: string
  /** Id of the quest OR info node this option points to. */
  refId: string
}

export interface NpcQuestObjective {
  /** Stable id used for tracking — independent of the display label, so
   * relabeling an objective never breaks progress. Reused directly as the
   * key `completeObjectiveIfAccepted` is called with from wherever the
   * real action happens (`windows-store.ts`, `work-log-modal.tsx`,
   * `character-sheet-modal.tsx`, `theme-provider.tsx`). */
  id: string
  label: string
}

export interface NpcQuest {
  id: string
  title: string
  description: string
  objectives: NpcQuestObjective[]
  /** Numeric XP awarded on turn-in — feeds the XP bar. */
  xpReward: number
  /** Flavor-only rewards beyond XP (items, achievement titles). */
  bonusRewards?: string[]
  /** Optional line the character says in the dialogue banner on turn-in.
   * Not every quest needs one. */
  completionLine?: string
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

/**
 * Every objective here completes automatically the moment the visitor
 * takes the real action it describes. Once every objective on a quest is
 * done, the quest becomes "ready" — but only actually completes (XP
 * awarded, dialogue line shown) when the visitor goes back and talks to
 * the NPC again to turn it in. `portfolio-tour` requires the three quests
 * above it to each be turned in, using the exact same mechanism (see
 * `src/lib/quest-store.ts`).
 */
export const sampleNpc: NpcData = {
  name: "Guardián del Portfolio",
  title: "Guía del reino",
  portraitUrl: "/avatar/me.png",
  greeting:
    "¡Saludos, aventurero! Bienvenido a mi portfolio. Acepta alguna misión y recorré el reino — cada objetivo se completa solo en cuanto hagas lo que pide. Volvé a hablarme cuando la tengas lista para entregarla.",
  options: [
    { type: "info", label: "¿Quién eres?", refId: "lore" },
    { type: "quest", label: "Conóceme", refId: "meet-jesus" },
    { type: "quest", label: "Recorre el Portafolio", refId: "explore-portfolio" },
    { type: "quest", label: "Llévate mi CV", refId: "grab-cv" },
    { type: "quest", label: "Recorrido Completo", refId: "portfolio-tour" },
    { type: "quest", label: "Recupera la Reliquia", refId: "recover-relic" },
  ],
  quests: [
    {
      id: "meet-jesus",
      title: "Conóceme",
      description: "Antes de nada, un par de cosas para que ubiques el lugar.",
      objectives: [
        { id: "open-character", label: "Abre la Hoja de Personaje (tecla C)" },
        { id: "toggle-theme", label: "Cambia el tema claro/oscuro (tecla T)" },
      ],
      xpReward: 100,
      completionLine: "La verdad... el modo oscuro me gusta más. No se lo digas a nadie.",
    },
    {
      id: "explore-portfolio",
      title: "Recorre el Portafolio",
      description:
        "Todo lo que construí está repartido en estas ventanas — dales una vuelta.",
      objectives: [
        { id: "open-quests", label: "Abre el Registro de Misiones (tecla L)" },
        { id: "view-project", label: "Explora el detalle de un proyecto" },
        { id: "review-experience", label: "Revisa la pestaña Experiencia" },
        { id: "open-talents", label: "Abre el Stack & Talentos (tecla P)" },
        { id: "open-achievements", label: "Abre los Logros (tecla Y)" },
        { id: "open-social", label: "Abre Contacto & Redes (tecla J)" },
      ],
      xpReward: 500,
      bonusRewards: ["Logro: Explorador"],
      completionLine: "Viste todo el trabajo — gracias por tomarte el tiempo.",
    },
    {
      id: "grab-cv",
      title: "Llévate mi CV",
      description: "Si te interesó lo que viste, llevate el currículum completo.",
      objectives: [
        { id: "download-cv", label: "Descarga el CV desde la Hoja de Personaje" },
      ],
      xpReward: 250,
      bonusRewards: ["Objeto: CV.pdf"],
    },
    {
      id: "portfolio-tour",
      title: "Recorrido Completo",
      description: "Completaste todas las misiones anteriores. Gracias por la visita.",
      objectives: [
        { id: "meet-jesus-done", label: "Completa: Conóceme" },
        { id: "explore-portfolio-done", label: "Completa: Recorre el Portafolio" },
        { id: "grab-cv-done", label: "Completa: Llévate mi CV" },
      ],
      xpReward: 1000,
      bonusRewards: ["Logro: Explorador Completo"],
      completionLine: "Recorriste todo el reino. Espero que hablemos pronto — de verdad.",
    },
    {
      id: "recover-relic",
      title: "Recupera la Reliquia",
      description:
        "Dos guardias custodian un cofre al este del campamento. Derrótalos y reclama lo que esconde.",
      objectives: [
        { id: "defeat-guards", label: "Derrota a los dos guardias" },
        { id: "open-chest", label: "Abre el cofre" },
      ],
      xpReward: 400,
      bonusRewards: ["Objeto: Reliquia del Cofre"],
      completionLine: "Esa reliquia estuvo bien guardada. Gracias por el esfuerzo, aventurero.",
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
