import { useEffect } from "react"
import { play } from "cuelume"
import { X } from "lucide-react"

import { Drawer, DrawerClose, DrawerContent, DrawerTitle } from "@/components/ui/8bit/drawer"
import { ScrollArea } from "@/components/ui/8bit/scroll-area"
import { WowDraggableWindow } from "@/components/wow/wow-draggable-window"
import { useIsMobile } from "@/lib/use-is-mobile"

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

const HELP_TITLE = "GUÍA & CONTROLES"

interface ControlBinding {
  action: string
  key: string
}

/** Desktop bindings — matches `useMovementInput`'s keyBindings and the
 * action/micro bar hotkeys, kept as literal labels for readability. */
const DESKTOP_CONTROLS: ControlBinding[] = [
  { action: "Moverse", key: "WASD / Flechas" },
  { action: "Caminar hacia adelante", key: "Click izq. + der. juntos" },
  { action: "Girar la cámara", key: "Arrastrar con click izquierdo" },
  { action: "Interactuar (NPC / cofre)", key: "E" },
  { action: "Atacar — lanzar hacha", key: "2" },
  { action: "Abrir la ventana actual", key: "C · L · P · Y · J · H · O" },
  { action: "Cerrar ventana enfocada", key: "Esc" },
]

const MOBILE_CONTROLS: ControlBinding[] = [
  { action: "Moverse", key: "Joystick virtual" },
  { action: "Girar la cámara", key: "Deslizar el dedo" },
  { action: "Interactuar", key: 'Botón "Interactuar"' },
  { action: "Atacar — lanzar hacha", key: "Slots de la barra inferior" },
  { action: "Abrir ventanas", key: "Menú (esquina inferior derecha)" },
  { action: "Cerrar ventana", key: "Botón X" },
]

/** Title bar — stays pinned above the scrollable body in both shells. */
function HelpHeader() {
  return (
    <header
      data-window-drag-handle
      className="cursor-move touch-none border-b-4 border-border px-4 py-3 pr-12 select-none"
    >
      <h2 className="retro text-xs leading-snug">{HELP_TITLE}</h2>
      <p className="mt-0.5 font-sans text-xs text-muted-foreground">
        Cómo moverte, atacar e interactuar en el mundo
      </p>
    </header>
  )
}

function ControlsBlock({
  title,
  controls,
}: {
  title: string
  controls: ControlBinding[]
}) {
  return (
    <div>
      <h3 className="mb-2 border-b-4 border-border pb-1 text-xs font-bold tracking-widest text-muted-foreground uppercase">
        {title}
      </h3>
      <ul className="flex flex-col">
        {controls.map((control) => (
          <li
            key={control.action}
            className="flex items-center justify-between gap-3 border-b-2 border-dashed border-border py-1.5 last:border-b-0"
          >
            <span className="font-sans text-xs">{control.action}</span>
            <span className="shrink-0 rounded-none border border-foreground/40 bg-background px-1.5 py-0.5 font-sans text-[11px] font-bold tabular-nums dark:border-ring">
              {control.key}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function HelpBody() {
  const isMobile = useIsMobile()

  return (
    <div className="flex flex-col gap-4 p-4">
      <p className="font-sans text-xs leading-relaxed text-muted-foreground">
        Explora el mundo, hablá con el NPC y{" "}
        <span className="text-foreground">derrotá a los guardias</span> para
        poder abrir el cofre y completar la misión.
      </p>

      <ControlsBlock
        title={isMobile ? "Controles táctiles" : "Controles"}
        controls={isMobile ? MOBILE_CONTROLS : DESKTOP_CONTROLS}
      />

      <div>
        <h3 className="mb-2 border-b-4 border-border pb-1 text-xs font-bold tracking-widest text-muted-foreground uppercase">
          Ventanas del menú
        </h3>
        <p className="font-sans text-xs leading-relaxed text-muted-foreground">
          Hoja de Personaje (C), Registro de Proyectos (L), Stack & Talentos
          (P), Logros (Y), Redes (J), esta Guía (H) y Opciones (O). Abrí varias
          a la vez y arrastralas por la pantalla.
        </p>
      </div>

      <p className="font-sans text-xs text-muted-foreground">
        ¿Preferís el CV tradicional?{" "}
        <a href="/?resume" className="text-foreground hover:underline">
          Vé directo al currículum
        </a>
        .
      </p>
    </div>
  )
}

/** Everything the desktop window shell wraps. */
function HelpContent() {
  return (
    <>
      <HelpHeader />
      <HelpBody />
    </>
  )
}

/**
 * Help & Controls — bound to the 'H' hotkey / micro-menu icon. A full
 * control reference for desktop and mobile, replacing the old one-line
 * `ControlsHint` banner with a closable, draggable window.
 */
export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const isMobile = useIsMobile()

  useEffect(() => {
    if (isOpen) play("ready")
  }, [isOpen])

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[85svh]">
          <DrawerTitle className="sr-only">{HELP_TITLE}</DrawerTitle>
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

            <HelpHeader />

            <ScrollArea className="min-h-0 flex-1">
              <HelpBody />
            </ScrollArea>
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <WowDraggableWindow
      id="help"
      isOpen={isOpen}
      onClose={onClose}
      className="h-fit w-[min(512px,calc(100svw-2rem))] max-h-[85svh]"
    >
      <HelpContent />
    </WowDraggableWindow>
  )
}
