import { ActionBar } from "@/components/wow/action-bar"
import { BuffBar } from "@/components/wow/buff-bar"
import { ChatBox } from "@/components/wow/chat-box"
import { MicroBar } from "@/components/wow/micro-bar"
import { PlayerUnitFrame } from "@/components/wow/player-unit-frame"

export function App() {
  return (
    <div className="flex min-h-svh p-6">
      <PlayerUnitFrame />
      <BuffBar />
      <MicroBar />
      <ChatBox />
      <ActionBar />
    </div>
  )
}

export default App
