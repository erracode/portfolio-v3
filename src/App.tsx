import { ActionBar } from "@/components/wow/action-bar"
import { BuffBar } from "@/components/wow/buff-bar"
import { ChatBox } from "@/components/wow/chat-box"
import { MicroBar } from "@/components/wow/micro-bar"
import { PlayerUnitFrame } from "@/components/wow/player-unit-frame"
import { QuestDialogueBanner } from "@/components/wow/quest-dialogue-banner"
import { QuestTracker } from "@/components/wow/quest-tracker"
import { WorldScene } from "@/components/wow/world-scene"
import { XpBarHud } from "@/components/wow/xp-bar-hud"

export function App() {
  return (
    <div className="flex min-h-svh p-6">
      <WorldScene />
      <PlayerUnitFrame />
      <BuffBar />
      <QuestTracker />
      <MicroBar />
      <ChatBox />
      <ActionBar />
      <QuestDialogueBanner />
      <XpBarHud />
    </div>
  )
}

export default App
