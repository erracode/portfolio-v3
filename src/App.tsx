import { ActionBar } from "@/components/wow/action-bar"
import { BuffBar } from "@/components/wow/buff-bar"
import { ChatBox } from "@/components/wow/chat-box"
import { DamageVignette } from "@/components/wow/damage-vignette"
import { GameOverDialog } from "@/components/wow/game-over-dialog"
import { InitialLoadingScreen } from "@/components/wow/initial-loading-screen"
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
          <div className="fixed top-4 left-4 z-40 flex items-start gap-3">
            <PlayerUnitFrame />
            <TargetFrame />
          </div>
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
      <GameOverDialog />
      <InitialLoadingScreen />
    </div>
  )
}

export default App
