import { useState } from "react"
import { play } from "cuelume"

import { Avatar } from "@/components/ui/8bit/avatar"
import { Button } from "@/components/ui/8bit/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/8bit/dialog"
import { SpriteAnimation } from "@/components/wow/sprite-animation"

import { useLogStore } from "@/lib/log-store"
import { useQuestStore, type QuestStatus } from "@/lib/quest-store"

import { NPC_SPRITE } from "@/data/sprites"
import type { NpcData, NpcInfoNode, NpcQuest } from "@/data/npc"

/** Portrait footprint (px) — the sprite is scaled down to fit this. */
const PORTRAIT_SIZE = 56

type ViewState = "greeting" | "quest_detail" | "info_detail"

interface NpcQuestDialogProps {
  isOpen: boolean
  onClose: () => void
  npcData: NpcData
}

/** Symbol + color for each quest state, matching WoW's own marker
 * language: gold "!" available, gray "?" in progress, gold "?" ready to
 * turn in, muted "✓" already turned in. */
function questMarker(status: QuestStatus): { symbol: string; className: string } {
  switch (status) {
    case "accepted":
      return { symbol: "?", className: "text-muted-foreground" }
    case "ready":
      return { symbol: "?", className: "text-[#ffd100]" }
    case "completed":
      return { symbol: "✓", className: "text-muted-foreground" }
    default:
      return { symbol: "!", className: "text-[#ffd100]" }
  }
}

/**
 * WoW-style NPC interaction dialog with an internal state machine
 * (greeting -> quest detail / info detail). Reusable via props.
 * The parent should key this by open state so it remounts (and thus resets
 * to GREETING) on every open — see App.tsx.
 * Quest progress is read from the persistent quest store; there is no
 * manual "Completar" button — every objective completes on its own from a
 * real site action (see `quest-store.ts`), so this dialog only displays
 * that progress rather than letting the visitor self-report it done.
 */
export function NpcQuestDialog({
  isOpen,
  onClose,
  npcData,
}: NpcQuestDialogProps) {
  const [viewState, setViewState] = useState<ViewState>("greeting")
  const [selectedQuest, setSelectedQuest] = useState<NpcQuest | null>(null)
  const [selectedInfo, setSelectedInfo] = useState<NpcInfoNode | null>(null)

  const questStatuses = useQuestStore((state) => state.quests)
  const objectiveDone = useQuestStore((state) => state.objectives)

  const openQuest = (quest: NpcQuest) => {
    setSelectedQuest(quest)
    setViewState("quest_detail")
    useLogStore.getState().addLog("quest", `Opened quest: "${quest.title}"`)
  }

  const openInfo = (node: NpcInfoNode) => {
    setSelectedInfo(node)
    setViewState("info_detail")
    useLogStore.getState().addLog("system", `Opened info: "${node.title}"`)
  }

  const backToGreeting = () => {
    setViewState("greeting")
    setSelectedQuest(null)
    setSelectedInfo(null)
  }

  const handleAccept = () => {
    if (selectedQuest) {
      useQuestStore.getState().acceptQuest(selectedQuest.id)
      useLogStore
        .getState()
        .addLog("quest", `Accepted quest: "${selectedQuest.title}"`)
      play("arrival")
    }
    backToGreeting()
  }

  const handleTurnIn = () => {
    if (selectedQuest) {
      useQuestStore.getState().turnInQuest(selectedQuest.id)
      useLogStore
        .getState()
        .addLog("quest", `Completed quest: "${selectedQuest.title}"`)
    }
    backToGreeting()
  }

  const selectedStatus: QuestStatus = selectedQuest
    ? (questStatuses[selectedQuest.id] ?? "available")
    : "available"

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="flex h-[min(420px,76svh)] flex-col gap-0 p-0 sm:h-[min(480px,80svh)] sm:max-w-md">
        {/* Portrait protrudes from the top-left border of the dialog.
            Positioned via an external wrapper: the 8bit Avatar applies
            className to BOTH its wrapper and inner root, so absolute
            positioning must not go on the Avatar itself. */}
        <div className="absolute -top-6 -left-6 z-10">
          <Avatar variant="default" className="size-14 items-center justify-center bg-card">
            <SpriteAnimation
              src={NPC_SPRITE.src}
              frameWidth={NPC_SPRITE.frameWidth}
              frameHeight={NPC_SPRITE.frameHeight}
              frameCount={NPC_SPRITE.rows.idle.frameCount}
              sheetWidth={NPC_SPRITE.sheetWidth}
              sheetHeight={NPC_SPRITE.sheetHeight}
              fps={4}
              scale={PORTRAIT_SIZE / NPC_SPRITE.frameWidth}
              aria-label={npcData.name}
            />
          </Avatar>
        </div>

        {/* Header: NPC name, beside the portrait. */}
        <header className="flex items-center gap-3 border-b-4 border-border py-3 pr-12 pl-16">
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-xs leading-snug break-words">
              {npcData.name}
            </DialogTitle>
          </div>
        </header>

        {/* Scrollable body: descriptive text on top, options below it.
            Long paragraphs use font-sans (Geist Pixel) — the retro/
            Press Start 2P font inherited from the dialog doesn't wrap
            readably at this width. */}
        <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4">
          {viewState === "greeting" && (
            <div className="flex min-w-0 flex-col gap-3">
              <p className="font-sans text-sm leading-normal text-muted-foreground sm:leading-relaxed">
                {npcData.greeting}
              </p>
              <div className="flex min-w-0 flex-col gap-1">
                {npcData.options.map((option) => {
                  const quest =
                    option.type === "quest"
                      ? npcData.quests.find((q) => q.id === option.refId)
                      : undefined
                  const node =
                    option.type === "info"
                      ? npcData.infoNodes.find((n) => n.id === option.refId)
                      : undefined
                  return (
                    <Button
                      key={option.refId}
                      variant="ghost"
                      font="normal"
                      className="min-w-0 justify-start"
                      onClick={() => {
                        if (quest) openQuest(quest)
                        else if (node) openInfo(node)
                      }}
                      data-cuelume-press
                      data-cuelume-release
                    >
                      <span
                        className={`w-4 shrink-0 text-center font-bold ${
                          option.type === "quest"
                            ? questMarker(questStatuses[option.refId] ?? "available")
                                .className
                            : ""
                        }`}
                      >
                        {option.type === "quest"
                          ? questMarker(questStatuses[option.refId] ?? "available").symbol
                          : "💬"}
                      </span>
                      <span className="min-w-0 truncate text-left">{option.label}</span>
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          {viewState === "quest_detail" && selectedQuest && (
            <div className="flex min-w-0 flex-col gap-3">
              <p className="font-sans text-sm leading-normal sm:leading-relaxed">
                {selectedQuest.description}
              </p>
              <div>
                <p className="mb-1 font-sans text-xs font-semibold text-muted-foreground">
                  Objetivos
                </p>
                <ul className="flex flex-col gap-0.5">
                  {selectedQuest.objectives.map((objective) => (
                    <li
                      key={objective.id}
                      className={`font-sans text-sm ${
                        objectiveDone[objective.id]
                          ? "text-foreground line-through"
                          : "text-muted-foreground"
                      }`}
                    >
                      {objectiveDone[objective.id] ? "✓" : "•"} {objective.label}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1 font-sans text-xs font-semibold text-muted-foreground">
                  Recompensas
                </p>
                <ul className="flex flex-col gap-0.5">
                  <li className="font-sans text-sm text-muted-foreground">
                    +{selectedQuest.xpReward} XP
                  </li>
                  {selectedQuest.bonusRewards?.map((reward) => (
                    <li key={reward} className="font-sans text-sm text-muted-foreground">
                      {reward}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {viewState === "info_detail" && selectedInfo && (
            <p className="font-sans text-sm leading-normal sm:leading-relaxed">
              {selectedInfo.text}
            </p>
          )}
        </div>

        {/* Footer: buttons anchored to the bottom of the dialog. There is
            no self-report "Completar" — a quest only turns in here once
            every objective is genuinely done (status "ready"); an
            in-progress quest just shows its live objective checklist
            above until the real actions finish it. */}
        {viewState === "quest_detail" && selectedQuest && (
          <footer className="flex items-center justify-between gap-2 border-t-4 border-border p-3 sm:p-4">
            {selectedStatus === "available" && (
              <>
                <Button
                  variant="destructive"
                  onClick={backToGreeting}
                  data-cuelume-press
                  data-cuelume-release
                >
                  Rechazar
                </Button>
                <Button
                  variant="default"
                  onClick={handleAccept}
                  data-cuelume-press
                  data-cuelume-release
                >
                  Aceptar
                </Button>
              </>
            )}
            {selectedStatus === "ready" && (
              <>
                <Button
                  variant="outline"
                  onClick={backToGreeting}
                  data-cuelume-press
                  data-cuelume-release
                >
                  Volver
                </Button>
                <Button
                  variant="default"
                  onClick={handleTurnIn}
                  data-cuelume-press
                  data-cuelume-release
                >
                  Entregar
                </Button>
              </>
            )}
            {(selectedStatus === "accepted" || selectedStatus === "completed") && (
              <Button
                variant="outline"
                onClick={backToGreeting}
                data-cuelume-press
                data-cuelume-release
              >
                Volver
              </Button>
            )}
          </footer>
        )}

        {viewState === "info_detail" && (
          <footer className="flex items-center justify-start border-t-4 border-border p-3 sm:p-4">
            <Button
              variant="outline"
              onClick={backToGreeting}
              data-cuelume-press
              data-cuelume-release
            >
              &lt; Volver
            </Button>
          </footer>
        )}
      </DialogContent>
    </Dialog>
  )
}
