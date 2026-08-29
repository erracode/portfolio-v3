import { useEffect, useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import * as THREE from "three"

import { NpcQuestDialog } from "@/components/wow/npc-quest-dialog"
import { TouchJoystick } from "@/components/wow/touch-joystick"
import { WorldCameraRig } from "@/components/wow/world-camera-rig"
import { WorldChest } from "@/components/wow/world-chest"
import { WorldCombatController } from "@/components/wow/world-combat-controller"
import { WorldFlag } from "@/components/wow/world-flag"
import { WorldGround } from "@/components/wow/world-ground"
import { WorldGuard } from "@/components/wow/world-guard"
import { WorldNpc } from "@/components/wow/world-npc"
import { WorldPlayer } from "@/components/wow/world-player"
import { WorldZeppelin } from "@/components/wow/world-zeppelin"
import { sampleNpc } from "@/data/npc"
import { DUKE_SPRITE, FERRIS_SPRITE, GOPHER_SPRITE } from "@/data/guard-sprites"
import { useIsTouchDevice } from "@/lib/use-is-mobile"
import { useMovementInput } from "@/lib/use-movement-input"
import { WORLD_CONFIG } from "@/lib/world-config"

/** Tracks the resolved (never "system") theme by watching the class
 * `theme-provider.tsx` already applies to `<html>` — simpler and more
 * robust than re-deriving system-preference resolution a second time, and
 * it also catches an OS-level theme flip while the site is set to
 * "system" (which doesn't otherwise change `useTheme()`'s `theme` value). */
function useIsDarkTheme(): boolean {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  )

  useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains("dark"))
    })
    observer.observe(root, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  return isDark
}

/** On a touch device this doubles as the "E" interact key's touch
 * equivalent — a real tappable button in the same spot, since there's no
 * keyboard to press E on. */
function InteractPrompt({ onInteract }: { onInteract: () => void }) {
  const isTouchDevice = useIsTouchDevice()
  const positionClassName = "fixed bottom-24 left-1/2 z-30 -translate-x-1/2 border-y-4 border-foreground bg-card px-3 py-1.5 dark:border-ring"

  if (isTouchDevice) {
    return (
      <button
        type="button"
        onPointerDown={(event) => {
          event.preventDefault()
          onInteract()
        }}
        className={positionClassName}
      >
        <p className="retro text-[10px]">Interactuar</p>
      </button>
    )
  }

  return (
    <div className={`pointer-events-none ${positionClassName}`}>
      <p className="retro text-[10px]">Presiona E</p>
    </div>
  )
}

/**
 * Permanent 3D background — mimics WoW's structure exactly: this world with
 * the player's character is always rendering behind the HUD (PlayerUnitFrame,
 * BuffBar, ChatBox, MicroBar, ActionBar, the 5 draggable windows), same
 * camera always active. Mounted once as the first child of `App.tsx`.
 */
export function WorldScene() {
  const isDark = useIsDarkTheme()
  const positionRef = useRef(new THREE.Vector3(0, 0, 0))
  const { movementRef, interactPressedRef, setExternalFlags } = useMovementInput()
  const [isNearNpc, setIsNearNpc] = useState(false)
  const [isNearChest, setIsNearChest] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { offset } = WORLD_CONFIG.camera
  const fogColor = isDark ? WORLD_CONFIG.fog.colorDark : WORLD_CONFIG.fog.colorLight

  return (
    <>
      <div className="fixed inset-0 z-0">
        <Canvas
          dpr={[1, 2]}
          gl={{ antialias: false }}
          camera={{ position: [offset.x, offset.y, offset.z], fov: 50 }}
        >
          <color attach="background" args={[fogColor]} />
          <fog attach="fog" args={[fogColor, WORLD_CONFIG.fog.near, WORLD_CONFIG.fog.far]} />
          <ambientLight intensity={isDark ? 0.4 : 0.7} />
          <directionalLight position={[5, 8, 5]} intensity={isDark ? 0.5 : 1} />

          <WorldGround isDark={isDark} />
          <WorldNpc />
          <WorldFlag />
          <WorldZeppelin />
          <WorldGuard
            id="guard-ferris"
            name="Guardia Ferris"
            skin={FERRIS_SPRITE}
            spawnPosition={WORLD_CONFIG.guards.positions.ferris}
          />
          <WorldGuard
            id="guard-gopher"
            name="Guardia Gopher"
            skin={GOPHER_SPRITE}
            spawnPosition={WORLD_CONFIG.guards.positions.gopher}
          />
          <WorldGuard
            id="guard-duke"
            name="Guardia Duke"
            skin={DUKE_SPRITE}
            spawnPosition={WORLD_CONFIG.guards.positions.duke}
          />
          <WorldChest interactPressedRef={interactPressedRef} onNearChange={setIsNearChest} />
          <WorldCombatController />
          <WorldPlayer
            positionRef={positionRef}
            movementRef={movementRef}
            interactPressedRef={interactPressedRef}
            onNearNpcChange={setIsNearNpc}
            onInteract={() => setIsDialogOpen(true)}
          />
          <WorldCameraRig positionRef={positionRef} />
        </Canvas>
      </div>

      <TouchJoystick setExternalFlags={setExternalFlags} />

      {(isNearNpc || isNearChest) && !isDialogOpen && (
        <InteractPrompt onInteract={() => { interactPressedRef.current = true }} />
      )}

      <NpcQuestDialog
        key={isDialogOpen ? "open" : "closed"}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        npcData={sampleNpc}
      />
    </>
  )
}
