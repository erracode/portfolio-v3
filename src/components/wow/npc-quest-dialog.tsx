import { useState } from "react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/8bit/avatar"
import { Button } from "@/components/ui/8bit/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/8bit/dialog"

import { useLogStore } from "@/lib/log-store"
import { useQuestStore, type QuestStatus } from "@/lib/quest-store"

import type { NpcData, NpcInfoNode, NpcQuest } from "@/data/npc"

type ViewState = "greeting" | "quest_detail" | "info_detail"

interface NpcQuestDialogProps {
  isOpen: boolean
  onClose: () => void
  npcData: NpcData
}

/** Fallback portrait used when an NPC has no portraitUrl assigned. */
const DEFAULT_PORTRAIT = "/social/talk-icon.png"

function questMarker(status: QuestStatus): string {
  switch (status) {
    case "accepted":
      return "?"
    case "completed":
      return "✓"
    default:
      return "!"
  }
}

/**
 * WoW-style NPC interaction dialog with an internal state machine
 * (greeting -> quest detail / info detail). Reusable via props.
 * The parent should key this by open state so it remounts (and thus resets
 * to GREETING) on every open — see App.tsx.
 * Quest progress is read/written to the persistent quest store.
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
    }
    backToGreeting()
  }

  const handleComplete = () => {
    if (selectedQuest) {
      useQuestStore.getState().completeQuest(selectedQuest.id)
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
      <DialogContent className="flex h-[min(480px,80svh)] flex-col gap-0 p-0 sm:max-w-md">
        {/* Portrait protrudes from the top-left border of the dialog.
            Positioned via an external wrapper: the 8bit Avatar applies
            className to BOTH its wrapper and inner root, so absolute
            positioning must not go on the Avatar itself. */}
        <div className="absolute -top-6 -left-6 z-10">
          <Avatar variant="default" className="size-14 bg-card">
            <AvatarImage
              src={npcData.portraitUrl || DEFAULT_PORTRAIT}
              alt={npcData.name}
            />
            <AvatarFallback>{npcData.name.charAt(0)}</AvatarFallback>
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

        {/* Scrollable body: descriptive text on top, options below it. */}
        <div className="flex-1 overflow-y-auto p-4">
          {viewState === "greeting" && (
            <div className="flex flex-col gap-3">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {npcData.greeting}
              </p>
              <div className="flex flex-col gap-1">
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
                      className="justify-start"
                      onClick={() => {
                        if (quest) openQuest(quest)
                        else if (node) openInfo(node)
                      }}
                      data-cuelume-press
                      data-cuelume-release
                    >
                      <span
                        className={`w-4 shrink-0 text-center font-bold ${
                          option.type === "quest" ? "text-primary" : ""
                        }`}
                      >
                        {option.type === "quest"
                          ? questMarker(questStatuses[option.refId] ?? "available")
                          : "💬"}
                      </span>
                      <span>{option.label}</span>
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          {viewState === "quest_detail" && selectedQuest && (
            <div className="flex flex-col gap-3">
              <p className="text-sm leading-relaxed">
                {selectedQuest.description}
              </p>
              <div>
                <p className="mb-1 text-xs font-semibold text-muted-foreground">
                  Objetivos
                </p>
                <ul className="flex flex-col gap-0.5">
                  {selectedQuest.objectives.map((obj) => (
                    <li key={obj} className="text-sm text-muted-foreground">
                      • {obj}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold text-muted-foreground">
                  Recompensas
                </p>
                <ul className="flex flex-col gap-0.5">
                  {selectedQuest.rewards.map((reward) => (
                    <li key={reward} className="text-sm text-muted-foreground">
                      {reward}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {viewState === "info_detail" && selectedInfo && (
            <p className="text-sm leading-relaxed">{selectedInfo.text}</p>
          )}
        </div>

        {/* Footer: buttons anchored to the bottom of the dialog. */}
        {viewState === "quest_detail" && selectedQuest && (
          <footer className="flex items-center justify-between gap-2 border-t-4 border-border p-4">
            {selectedStatus === "completed" ? (
              <Button
                variant="outline"
                onClick={backToGreeting}
                data-cuelume-press
                data-cuelume-release
              >
                Volver
              </Button>
            ) : (
              <>
                <Button
                  variant="destructive"
                  onClick={backToGreeting}
                  data-cuelume-press
                  data-cuelume-release
                >
                  Rechazar
                </Button>
                {selectedStatus === "accepted" ? (
                  <Button
                    variant="default"
                    onClick={handleComplete}
                    data-cuelume-press
                    data-cuelume-release
                  >
                    Completar
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    onClick={handleAccept}
                    data-cuelume-press
                    data-cuelume-release
                  >
                    Aceptar
                  </Button>
                )}
              </>
            )}
          </footer>
        )}

        {viewState === "info_detail" && (
          <footer className="flex items-center justify-start border-t-4 border-border p-4">
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
