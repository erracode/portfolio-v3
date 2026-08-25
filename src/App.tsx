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
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Project ready!</h1>
          <p>You may now add components and start building.</p>
          <p>We&apos;ve already added the button component for you.</p>
          <Button className="mt-2">Button</Button>
        </div>
        <div className="flex flex-col items-start gap-2">
          <Button variant="outline" onClick={() => setNpcOpen(true)}>
            Hablar con NPC
          </Button>
          <div className="font-mono text-xs text-muted-foreground">
            (Press <kbd>d</kbd> to toggle dark mode)
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
