import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
  type SVGProps,
} from "react"
import { Link } from "@tanstack/react-router"
import { play } from "cuelume"
import { FileUser, Swords } from "lucide-react"

import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/8bit/dialog"
// The base content, not the 8bit wrapper: the wrapper types its props as a
// plain <div>, which hides Radix's `onCloseAutoFocus` used below. The 8bit
// pixel frame is re-applied by hand (same classes as the wrapper).
import { DialogContent } from "@/components/ui/dialog"
import {
  HELP_SEEN_STORAGE_KEY,
  hasSeen,
  markSeen,
  useOnboardingStore,
  WELCOME_SEEN_STORAGE_KEY,
} from "@/lib/onboarding-store"
import { useIsTouchDevice } from "@/lib/use-is-mobile"
import { useWindowsStore } from "@/lib/windows-store"

const CHOICE_CARD_CLASS =
  "relative flex min-w-0 flex-col items-start gap-2 border-y-6 border-foreground bg-card p-3 text-left transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4 dark:border-ring"

/** Same pixel-frame recipe as the talent spec cards: the `border-y-6` on the
 * card plus this absolutely-positioned `border-x-6` overlay. */
function ChoiceCardContent({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  description: ReactNode
}) {
  return (
    <>
      <span className="flex w-full items-center gap-2 border-b-4 border-border pb-2">
        <Icon className="size-5 shrink-0" aria-hidden="true" />
        <span className="min-w-0 text-xs font-bold tracking-wide uppercase">
          {title}
        </span>
      </span>
      <span className="font-sans text-xs leading-relaxed text-muted-foreground">
        {description}
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-inherit"
      />
    </>
  )
}

/**
 * First-visit greeting on the game route: lets the visitor either stay in
 * the 3D world or jump straight to the plain `/resume`. Shown once —
 * remembered under `WELCOME_SEEN_STORAGE_KEY` whichever path is taken
 * (Esc, overlay click and the X all count as "explore").
 *
 * Waits for `InitialLoadingScreen` to finish so it never sits under the
 * loader, and owns the first-visit Help auto-open that `MicroBar` used to
 * do on mount: Help opens only after the visitor picks "explore", so two
 * auto-opened windows never stack (and someone heading to the CV isn't
 * shown game controls).
 */
export function WelcomeModal() {
  const worldReady = useOnboardingStore((state) => state.worldReady)
  const openWindow = useWindowsStore((state) => state.openWindow)
  const isTouch = useIsTouchDevice()
  const [dismissed, setDismissed] = useState(() =>
    hasSeen(WELCOME_SEEN_STORAGE_KEY)
  )
  const openHelpAfterCloseRef = useRef(false)

  const isOpen = worldReady && !dismissed

  useEffect(() => {
    if (isOpen) play("ready")
  }, [isOpen])

  const exploreWorld = () => {
    markSeen(WELCOME_SEEN_STORAGE_KEY)
    if (!hasSeen(HELP_SEEN_STORAGE_KEY)) {
      markSeen(HELP_SEEN_STORAGE_KEY)
      openHelpAfterCloseRef.current = true
    }
    setDismissed(true)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && exploreWorld()}>
      <DialogContent
        className="retro flex max-h-[85svh] flex-col rounded-none border-none bg-card p-2.5 ring-0 sm:max-w-xl"
        // The game's movement keys and window hotkeys listen on `window`;
        // without this, typing WASD/C/9 while the dialog has focus would
        // move the player or open windows behind it. Radix's own Esc
        // handling listens in the capture phase, so it still works.
        onKeyDown={(event) => event.stopPropagation()}
        // Opening Help here (after the close animation and Radix's focus
        // restore) instead of in `exploreWorld` keeps the dialog's
        // unmount from yanking focus back out of the mobile Help drawer.
        onCloseAutoFocus={(event) => {
          if (!openHelpAfterCloseRef.current) return
          openHelpAfterCloseRef.current = false
          event.preventDefault()
          openWindow("help")
        }}
      >
        {/* Scrolls on its own (only short landscape phones ever need it) so
            the pixel frame below, which sits outside the content box, isn't
            clipped; the padding leaves room for the cards' frames/outline. */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-1.5">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-sm leading-snug">
              ¡Bienvenido/a!
            </DialogTitle>
            <DialogDescription className="font-sans text-xs leading-relaxed">
              Soy Jesús Díaz, Senior Full-Stack Engineer. Este portfolio es un
              pequeño mundo 3D estilo WoW: ¿cómo querés recorrerlo?
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={exploreWorld}
              className={CHOICE_CARD_CLASS}
              data-cuelume-press
              data-cuelume-release
            >
              <ChoiceCardContent
                icon={Swords}
                title="Explorar el mundo 3D"
                description={
                  isTouch
                    ? "Movete con el joystick, hablá con el NPC y descubrí mis proyectos jugando."
                    : "Movete con WASD, hablá con el NPC y descubrí mis proyectos jugando."
                }
              />
            </button>

            <Link
              to="/resume"
              onClick={() => markSeen(WELCOME_SEEN_STORAGE_KEY)}
              className={CHOICE_CARD_CLASS}
              data-cuelume-press
              data-cuelume-release
            >
              <ChoiceCardContent
                icon={FileUser}
                title="Ver el CV directo"
                description="Versión simple, rápida e imprimible."
              />
            </Link>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-foreground dark:border-ring"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -my-1.5 border-y-6 border-foreground dark:border-ring"
        />
      </DialogContent>
    </Dialog>
  )
}
