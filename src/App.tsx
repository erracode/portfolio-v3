import { ActionBar } from "@/components/wow/action-bar"
import { BuffBar } from "@/components/wow/buff-bar"
import { ChatBox } from "@/components/wow/chat-box"
import { DamageVignette } from "@/components/wow/damage-vignette"
import { MicroBar } from "@/components/wow/micro-bar"
import { MobileBuffBar } from "@/components/wow/mobile-buff-bar"
import { MobileChatBox } from "@/components/wow/mobile-chat-box"
import { MobileUnitFrames } from "@/components/wow/mobile-unit-frames"
import { PlayerDamageNumbers } from "@/components/wow/player-damage-numbers"
import { PlayerUnitFrame } from "@/components/wow/player-unit-frame"
import { QuestDialogueBanner } from "@/components/wow/quest-dialogue-banner"
import { QuestTracker } from "@/components/wow/quest-tracker"
import { TargetFrame } from "@/components/wow/target-frame"
import { WorldScene } from "@/components/wow/world-scene"
import { XpBarHud } from "@/components/wow/xp-bar-hud"
import { useIsMobile } from "@/lib/use-is-mobile"

export function App() {
  const isMobile = useIsMobile()

  return (
    <div className="flex min-h-svh p-6">
      <WorldScene />
      {isMobile ? (
        <>
          <MobileUnitFrames />
          <MobileBuffBar />
          <QuestTracker />
          <MicroBar />
          <MobileChatBox />
          <ActionBar />
          <XpBarHud />
        </>
      ) : (
        <>
          <PlayerUnitFrame />
          <TargetFrame />
          <BuffBar />
          <QuestTracker />
          <MicroBar />
          <ChatBox />
          <ActionBar />
          <XpBarHud />
        </>
      )}
      <QuestDialogueBanner />
      <PlayerDamageNumbers />
      <DamageVignette />
    </div>
  )
}

export default App
