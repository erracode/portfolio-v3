import { useEffect } from "react"
import { play } from "cuelume"
import { X } from "lucide-react"

import { Drawer, DrawerClose, DrawerContent, DrawerTitle } from "@/components/ui/8bit/drawer"
import { Label } from "@/components/ui/8bit/label"
import { Slider } from "@/components/ui/8bit/slider"
import { Switch } from "@/components/ui/8bit/switch"
import { WowDraggableWindow } from "@/components/wow/wow-draggable-window"
import { useIsMobile } from "@/lib/use-is-mobile"
import { useSettings } from "@/lib/settings-store"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const SETTINGS_TITLE = "OPCIONES"

/** Title bar — stays pinned above the body in both shells. */
function SettingsHeader() {
  return (
    <header
      data-window-drag-handle
      className="cursor-move touch-none border-b-4 border-border px-4 py-3 pr-12 select-none"
    >
      <h2 className="retro text-xs leading-snug">{SETTINGS_TITLE}</h2>
      <p className="mt-0.5 font-sans text-xs text-muted-foreground">
        Controles de audio
      </p>
    </header>
  )
}

/** The actual settings controls — volume slider + mute toggle, both wired
 * straight to the settings store, which applies each change to cuelume
 * (and, via `sfx.ts`, the raw combat SFX) immediately. */
function SettingsBody() {
  const { volume, muted, setVolume, setMuted } = useSettings()

  return (
    <div className="flex flex-col gap-5 p-4">
      <div className="flex flex-col gap-3">
        {/* No htmlFor/id pairing: Radix puts the Slider's `id` on the
            non-interactive Root wrapper, not the focusable Thumb — the
            Thumb gets its accessible name via `aria-label` instead (see
            `components/ui/8bit/slider.tsx`). */}
        <Label className="text-xs">Volumen</Label>
        <Slider
          aria-label="Volumen"
          value={[Math.round(volume * 100)]}
          max={100}
          step={1}
          disabled={muted}
          onValueChange={([value]) => setVolume(value / 100)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="settings-muted" className="text-xs">
          Silenciar
        </Label>
        <Switch
          id="settings-muted"
          checked={muted}
          onCheckedChange={setMuted}
        />
      </div>
    </div>
  )
}

/** Everything the desktop window shell wraps — composed from the header/
 * body pieces above so the mobile Drawer branch can recompose them around
 * its own scrolling boundary, same split as `SocialContent`. */
function SettingsContent() {
  return (
    <>
      <SettingsHeader />
      <SettingsBody />
    </>
  )
}

/**
 * Settings — bound to the micro-menu icon. Volume + mute controls, applied
 * live via `useSettingsStore` (cuelume's UI sounds and the raw combat SFX
 * in `sfx.ts` both read from the same store). Desktop keeps the draggable
 * window; mobile swaps in a bottom-sheet Drawer.
 */
export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const isMobile = useIsMobile()

  useEffect(() => {
    if (isOpen) play("ready")
  }, [isOpen])

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[85svh]">
          <DrawerTitle className="sr-only">{SETTINGS_TITLE}</DrawerTitle>
          <div className="relative flex min-h-0 flex-1 flex-col">
            <DrawerClose asChild>
              <button
                type="button"
                aria-label="Cerrar ventana"
                className="absolute top-2 right-2 z-20 flex size-7 items-center justify-center border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
                data-cuelume-press
                data-cuelume-release
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </DrawerClose>

            <SettingsContent />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <WowDraggableWindow
      id="settings"
      isOpen={isOpen}
      onClose={onClose}
      className="h-fit w-[min(400px,calc(100svw-2rem))]"
    >
      <SettingsContent />
    </WowDraggableWindow>
  )
}
