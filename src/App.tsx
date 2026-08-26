import { useState } from "react"

import { ActionBar } from "@/components/wow/action-bar"
import { BuffBar } from "@/components/wow/buff-bar"
import { ChatBox } from "@/components/wow/chat-box"
import { MicroBar } from "@/components/wow/micro-bar"
import { NpcQuestDialog } from "@/components/wow/npc-quest-dialog"
import { PlayerUnitFrame } from "@/components/wow/player-unit-frame"
import { Button } from "@/components/ui/8bit/button"
import { sampleNpc } from "@/data/npc"

export function App() {
  const [npcOpen, setNpcOpen] = useState(false)

  return (
    <div className="flex min-h-svh p-6">
      <PlayerUnitFrame />
      <BuffBar />
      <MicroBar />
      <ChatBox />
      <ActionBar />
      <NpcQuestDialog
        key={npcOpen ? "open" : "closed"}
        isOpen={npcOpen}
        onClose={() => setNpcOpen(false)}
        npcData={sampleNpc}
      />
      {/* Kept as a reminder that the NPC dialog demo still exists — every
          other window now lives on the micro-menu (bottom-right). */}
      <div className="mt-24 flex flex-col items-start gap-2">
        <Button
          variant="outline"
          onClick={() => setNpcOpen(true)}
          data-cuelume-press
          data-cuelume-release
        >
          Hablar con NPC
        </Button>
      </div>
    </div>
  )
}

export default App
