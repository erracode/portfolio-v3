import { play } from "cuelume"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import { useDialogueStore } from "@/lib/dialogue-store"
import { sampleNpc } from "@/data/npc"

export type QuestStatus = "available" | "accepted" | "ready" | "completed"

/** XP needed per level, for the XP bar. */
export const XP_PER_LEVEL = 1000

interface QuestState {
  /** Quest id -> status. A missing id means "available". */
  quests: Record<string, QuestStatus>
  /** Objective id -> done. */
  objectives: Record<string, boolean>
  /** Total XP ever earned from turned-in quests. */
  totalXp: number
  acceptQuest: (id: string) => void
  /**
   * Marks one objective done — but only if its owning quest is currently
   * "accepted" (a quest you never picked up gets no credit). Once every
   * objective on that quest is done, the quest becomes "ready" and its
   * `completionLine` (if any) queues in the dialogue banner right away —
   * it still needs a manual turn-in (talk to the NPC again) to actually
   * complete and award XP.
   */
  completeObjectiveIfAccepted: (objectiveId: string) => void
  /**
   * Turns in a "ready" quest: awards its XP, plays the completion sound,
   * and marks a synthetic `${questId}-done` objective — the same
   * mechanism a later quest (e.g. the capstone) can require to know a
   * prior quest was turned in, with no special-cased logic.
   */
  turnInQuest: (id: string) => void
}

function findOwningQuest(objectiveId: string) {
  return sampleNpc.quests.find((quest) =>
    quest.objectives.some((objective) => objective.id === objectiveId)
  )
}

/**
 * Persistent mini-db of quest progress. Survives reloads via localStorage
 * (zustand persist). The NPC dialog reads/writes `quests`/`acceptQuest`/
 * `turnInQuest`; real site actions (opening a window, viewing a project,
 * downloading the CV, toggling the theme) call `completeObjectiveIfAccepted`
 * from wherever that action happens.
 */
export const useQuestStore = create<QuestState>()(
  persist(
    (set, get) => ({
      quests: {},
      objectives: {},
      totalXp: 0,

      acceptQuest: (id) =>
        set((state) => ({ quests: { ...state.quests, [id]: "accepted" } })),

      completeObjectiveIfAccepted: (objectiveId) => {
        const quest = findOwningQuest(objectiveId)
        if (!quest) return
        if (get().quests[quest.id] !== "accepted") return
        if (get().objectives[objectiveId]) return

        set((state) => ({
          objectives: { ...state.objectives, [objectiveId]: true },
        }))

        const allDone = quest.objectives.every(
          (objective) => get().objectives[objective.id]
        )
        if (allDone) {
          set((state) => ({ quests: { ...state.quests, [quest.id]: "ready" } }))
          if (quest.completionLine) {
            useDialogueStore.getState().pushLine(quest.completionLine)
          }
        }
      },

      turnInQuest: (id) => {
        const quest = sampleNpc.quests.find((q) => q.id === id)
        if (!quest) return
        if (get().quests[id] !== "ready") return

        set((state) => ({
          quests: { ...state.quests, [id]: "completed" },
          totalXp: state.totalXp + quest.xpReward,
        }))

        play("success")
        get().completeObjectiveIfAccepted(`${id}-done`)
      },
    }),
    // Bumped from "portfolio-quest-status" — the quest data model changed
    // (grouped quests + per-objective tracking + a ready/turn-in step), so
    // old persisted status from testing before this change would
    // otherwise be stale/orphaned.
    { name: "portfolio-quest-status-v2" }
  )
)

export function useQuestStatus(id: string): QuestStatus {
  return useQuestStore((state) => state.quests[id] ?? "available")
}

export function useObjectiveDone(objectiveId: string): boolean {
  return useQuestStore((state) => state.objectives[objectiveId] ?? false)
}
