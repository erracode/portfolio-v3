import { useState } from "react"

import { ActionBar } from "@/components/wow/action-bar"
import { BuffBar } from "@/components/wow/buff-bar"
import { CharacterPanelModal } from "@/components/wow/character-panel-modal"
import { ChatBox } from "@/components/wow/chat-box"
import { MicroBar } from "@/components/wow/micro-bar"
import { NpcQuestDialog } from "@/components/wow/npc-quest-dialog"
import { PlayerUnitFrame } from "@/components/wow/player-unit-frame"
import { TalentTreeModal } from "@/components/wow/talent-tree-modal"
import { Button } from "@/components/ui/8bit/button"
import { sampleNpc } from "@/data/npc"

export function App() {
  const [npcOpen, setNpcOpen] = useState(false)
  const [characterPanelOpen, setCharacterPanelOpen] = useState(false)
  const [talentTreeOpen, setTalentTreeOpen] = useState(false)

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
      <CharacterPanelModal
        key={characterPanelOpen ? "open" : "closed"}
        isOpen={characterPanelOpen}
        onClose={() => setCharacterPanelOpen(false)}
      />
      <TalentTreeModal
        key={talentTreeOpen ? "open" : "closed"}
        isOpen={talentTreeOpen}
        onClose={() => setTalentTreeOpen(false)}
      />
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Project ready!</h1>
          <p>You may now add components and start building.</p>
          <p>We&apos;ve already added the button component for you.</p>
          <Button className="mt-2">Button</Button>
        </div>
        <div className="flex flex-col items-start gap-2">
          <Button
            variant="outline"
            onClick={() => setNpcOpen(true)}
            data-cuelume-press
            data-cuelume-release
          >
            Hablar con NPC
          </Button>
          <Button
            variant="outline"
            onClick={() => setCharacterPanelOpen(true)}
            data-cuelume-press
            data-cuelume-release
          >
            Abrir Hoja de Personaje
          </Button>
          <Button
            variant="outline"
            onClick={() => setTalentTreeOpen(true)}
            data-cuelume-press
            data-cuelume-release
          >
            Abrir Árbol de Talentos
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
