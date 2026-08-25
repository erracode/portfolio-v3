import { create } from "zustand"
import { persist } from "zustand/middleware"

export type QuestStatus = "available" | "accepted" | "completed"

interface QuestState {
  /** Quest id -> status. A missing id means "available". */
  quests: Record<string, QuestStatus>
  acceptQuest: (id: string) => void
  completeQuest: (id: string) => void
}

/**
 * Persistent mini-db of quest progress. Survives reloads via localStorage
 * (zustand persist). The NPC dialog reads/writes this; the game system can
 * call completeQuest from elsewhere (e.g. downloading the CV).
 */
export const useQuestStore = create<QuestState>()(
  persist(
    (set) => ({
      quests: {},

      acceptQuest: (id) =>
        set((state) => ({ quests: { ...state.quests, [id]: "accepted" } })),

      completeQuest: (id) =>
        set((state) => ({ quests: { ...state.quests, [id]: "completed" } })),
    }),
    { name: "portfolio-quest-status" }
  )
)

export function useQuestStatus(id: string): QuestStatus {
  return useQuestStore((state) => state.quests[id] ?? "available")
}
