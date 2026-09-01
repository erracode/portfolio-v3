import { sampleNpc } from "@/data/npc"
import { useCombatStore } from "@/lib/combat-store"
import { useQuestStore } from "@/lib/quest-store"
import { cn } from "@/lib/utils"

/** Crisp black outline behind the light text, WoW's own trick for reading
 * the tracker over any background — a border/panel would work too, but
 * the reference is explicitly a plain floating list with none. */
const TEXT_OUTLINE = {
  textShadow:
    "1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000",
}

/**
 * Always-visible tracker of in-progress and ready-to-turn-in quests,
 * WoW-style: a plain floating list (no card, no border, transparent
 * background), pinned to the right edge below `BuffBar`. Bespoke instead
 * of reusing `@8bitcn/quest-log` — that block is a bordered Card with an
 * accordion, the wrong shape for this always-on HUD element.
 */
export function QuestTracker() {
  const questStatuses = useQuestStore((state) => state.quests)
  const objectiveDone = useQuestStore((state) => state.objectives)
  const hasTarget = useCombatStore((state) => state.targetId !== null)

  const activeQuests = sampleNpc.quests.filter((quest) => {
    const status = questStatuses[quest.id]
    return status === "accepted" || status === "ready"
  })

  if (activeQuests.length === 0) return null

  const readyCount = activeQuests.filter(
    (quest) => questStatuses[quest.id] === "ready"
  ).length
  const completedLabel = activeQuests.length === 1 ? "completada" : "completadas"

  return (
    <div
      className={cn(
        // `MobileUnitFrames` stacks a second (target) section below the
        // player frame only once something is targeted, growing tall
        // enough to reach this tracker's default `top-32` offset — bump
        // it clear of that worst case instead of overlapping. Desktop's
        // `TargetFrame` sits far to the left and never shares this
        // corner, so `md:top-28` stays fixed regardless of a target.
        hasTarget ? "top-[150px]" : "top-32",
        "pointer-events-none fixed right-3 z-30 flex w-64 max-w-[calc(100svw-2rem)] max-h-[calc(100svh-160px)] flex-col gap-2 overflow-hidden text-right md:top-28 md:right-4 md:max-h-none md:gap-3"
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p
          className="font-sans text-xs font-bold"
          style={{ ...TEXT_OUTLINE, color: "#ffd100" }}
        >
          Misiones
        </p>
        <p
          className="font-sans text-[10px] font-bold"
          style={{ ...TEXT_OUTLINE, color: "#f5f5f5" }}
        >
          {readyCount}/{activeQuests.length} {completedLabel}
        </p>
      </div>
      {activeQuests.map((quest) => (
        <div key={quest.id} className="flex flex-col gap-0.5">
          <p
            className="font-sans text-xs font-bold"
            style={{ ...TEXT_OUTLINE, color: "#ffd100" }}
          >
            {quest.title}
          </p>
          {questStatuses[quest.id] === "ready" && (
            <p
              className="font-sans text-[10px] font-bold"
              style={{ ...TEXT_OUTLINE, color: "#ffd100" }}
            >
              ¡Lista para entregar!
            </p>
          )}
          {quest.objectives.map((objective) => {
            const done = objectiveDone[objective.id] ?? false
            return (
              <p
                key={objective.id}
                className="font-sans text-[10px] leading-snug md:text-[11px]"
                style={{
                  ...TEXT_OUTLINE,
                  color: done ? "#9ca3af" : "#f5f5f5",
                  textDecoration: done ? "line-through" : "none",
                }}
              >
                {objective.label}
              </p>
            )
          })}
        </div>
      ))}
    </div>
  )
}
