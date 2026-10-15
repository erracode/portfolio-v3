import { useEffect, useRef, useState, type ReactNode } from "react"
import { Link } from "@tanstack/react-router"
import { play } from "cuelume"
import { XIcon } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/8bit/dialog"
// Overlay + portal come from the base shadcn dialog, but the content is
// built here on the Radix primitive: the shared `DialogContent` hardcodes its
// own overlay and styling, and this dialog needs a darker dim and a custom
// layout (see below). The 8bit pixel frame is re-applied by hand.
import { DialogOverlay, DialogPortal } from "@/components/ui/dialog"
import {
  HELP_SEEN_STORAGE_KEY,
  hasSeen,
  markSeen,
  useOnboardingStore,
  WELCOME_SEEN_STORAGE_KEY,
} from "@/lib/onboarding-store"
import { useIsTouchDevice } from "@/lib/use-is-mobile"
import { useWindowsStore } from "@/lib/windows-store"

const PREVIEW_3D_SRC = "/images/welcome/welcome-3d.webp"
const PREVIEW_RESUME_SRC = "/images/welcome/welcome-resume.webp"
const AVATAR_SRC = "/images/welcome/welcome-avatar.webp"
/** Intrinsic size of both previews (2:1) — reserves their box up front. */
const PREVIEW_WIDTH = 720
const PREVIEW_HEIGHT = 360

/**
 * The `group` drives the preview's hover/focus treatment. Hover styles only
 * apply on hover-capable pointers (Tailwind 4's `hover:` is gated by
 * `@media (hover: hover)`), and the lift is `motion-safe` only. The border
 * colour lives on the card and the side overlay inherits it, so the whole
 * pixel frame lights up together.
 */
const CHOICE_CARD_CLASS =
  "group relative flex min-w-0 flex-col border-y-6 border-foreground bg-card text-left outline-none transition-[translate,border-color,background-color] duration-150 ease-out hover:border-muted-foreground hover:bg-accent focus-visible:border-muted-foreground focus-visible:bg-accent focus-visible:outline-2 focus-visible:outline-offset-6 active:bg-accent motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 dark:border-ring dark:hover:border-foreground dark:focus-visible:border-foreground"

function ChoiceCardContent({
  imageSrc,
  imageAlt,
  title,
  description,
  hints,
}: {
  imageSrc: string
  imageAlt: string
  title: string
  description: string
  hints: ReactNode
}) {
  return (
    <>
      <span className="block overflow-hidden border-b-4 border-inherit bg-black">
        <img
          src={imageSrc}
          alt={imageAlt}
          width={PREVIEW_WIDTH}
          height={PREVIEW_HEIGHT}
          decoding="async"
          draggable={false}
          // Shorter crop on phones so both stacked cards fit without much
          // scrolling; the full 2:1 frame from `sm` up.
          className="block aspect-[3/1] w-full object-cover object-top brightness-90 transition-[filter] duration-150 ease-out group-hover:brightness-110 group-focus-visible:brightness-110 sm:aspect-[2/1]"
        />
      </span>
      <span className="flex flex-1 flex-col gap-2 p-3">
        <span className="retro text-[0.7rem] leading-snug tracking-wide uppercase">
          {title}
        </span>
        <span className="font-sans text-xs leading-relaxed text-muted-foreground">
          {description}
        </span>
        <span className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
          {hints}
        </span>
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-inherit"
      />
    </>
  )
}

function Hint({
  children,
  highlight = false,
}: {
  children: ReactNode
  highlight?: boolean
}) {
  return (
    <span
      className={
        highlight
          ? "border-2 border-yellow-400 bg-yellow-400 px-1.5 py-0.5 font-sans text-[0.65rem] leading-none font-bold text-black uppercase"
          : "border-2 border-border px-1.5 py-0.5 font-sans text-[0.65rem] leading-none text-muted-foreground"
      }
    >
      {children}
    </span>
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
 *
 * While open it publishes `welcomeOpen` so `WorldScene` stops rendering
 * the canvas every frame behind it.
 */
export function WelcomeModal() {
  const worldReady = useOnboardingStore((state) => state.worldReady)
  const setWelcomeOpen = useOnboardingStore((state) => state.setWelcomeOpen)
  const openWindow = useWindowsStore((state) => state.openWindow)
  const isTouch = useIsTouchDevice()
  const [dismissed, setDismissed] = useState(() =>
    hasSeen(WELCOME_SEEN_STORAGE_KEY)
  )
  const openHelpAfterCloseRef = useRef(false)

  const isOpen = worldReady && !dismissed

  // First visit only: warm the previews while the loading screen is still
  // up, so the cards paint complete the moment the dialog opens. Returning
  // visitors never see the dialog, so they skip the download.
  useEffect(() => {
    if (hasSeen(WELCOME_SEEN_STORAGE_KEY)) return
    for (const src of [PREVIEW_3D_SRC, PREVIEW_RESUME_SRC, AVATAR_SRC]) {
      const image = new Image()
      image.src = src
    }
  }, [])

  useEffect(() => {
    if (isOpen) play("ready")
    setWelcomeOpen(isOpen)
    // Also clears the flag if the route unmounts with the dialog open
    // (e.g. the CV link), so the world never comes back paused.
    return () => setWelcomeOpen(false)
  }, [isOpen, setWelcomeOpen])

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
      <DialogPortal>
        {/* A solid dim, never a `backdrop-blur`: the WebGL canvas
            underneath repaints every frame, and a backdrop-filter forces
            the compositor to re-blur the whole viewport each time it
            does. Slightly darker than the shared overlay's default. */}
        <DialogOverlay className="bg-black/75" />
        <DialogPrimitive.Content
          data-slot="dialog-content"
          className="retro fixed top-1/2 left-1/2 z-50 flex max-h-[88svh] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col bg-card p-2.5 text-sm text-popover-foreground outline-none data-open:animate-in data-open:fade-in-0 data-open:duration-200 data-open:ease-[cubic-bezier(0.23,1,0.32,1)] data-closed:animate-out data-closed:fade-out-0 data-closed:duration-150 data-closed:ease-out motion-safe:data-open:slide-in-from-bottom-2 motion-safe:data-open:zoom-in-[0.97] motion-safe:data-closed:zoom-out-[0.97] sm:max-w-2xl"
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
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-2">
            <DialogHeader className="flex-row items-start gap-3 pr-8 text-left sm:items-center">
              <img
                src={AVATAR_SRC}
                alt=""
                width={48}
                height={48}
                decoding="async"
                className="size-12 shrink-0 border-4 border-foreground object-cover dark:border-ring"
              />
              <div className="flex min-w-0 flex-col gap-1.5">
                <DialogTitle className="text-left text-sm leading-snug">
                  ¡Bienvenido/a!
                </DialogTitle>
                <DialogDescription className="font-sans text-xs leading-relaxed text-pretty">
                  Soy Jesús Díaz, Senior Full-Stack Engineer. Este portfolio
                  es un pequeño mundo 3D al estilo WoW. ¿Cómo quieres
                  recorrerlo?
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-4 px-1.5 sm:grid-cols-2">
              <button
                type="button"
                onClick={exploreWorld}
                className={CHOICE_CARD_CLASS}
                data-cuelume-press
                data-cuelume-release
              >
                <ChoiceCardContent
                  imageSrc={PREVIEW_3D_SRC}
                  imageAlt="Vista del mundo 3D: el personaje junto a banderas y el NPC"
                  title="Mundo 3D"
                  description="Habla con el NPC, abre el cofre y descubre mis proyectos jugando."
                  hints={
                    <>
                      <Hint highlight>Recomendado</Hint>
                      <Hint>{isTouch ? "Joystick" : "WASD · E · 1–9"}</Hint>
                    </>
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
                  imageSrc={PREVIEW_RESUME_SRC}
                  imageAlt="Vista del CV: encabezado con nombre, contacto y resumen"
                  title="CV directo"
                  description="Versión simple y rápida, sin juego: experiencia, stack y contacto."
                  hints={
                    <>
                      <Hint>Imprimible</Hint>
                      <Hint>1 min de lectura</Hint>
                    </>
                  }
                />
              </Link>
            </div>

            <p className="px-1.5 font-sans text-[0.7rem] leading-relaxed text-muted-foreground">
              Puedes cambiar en cualquier momento desde la barra de acciones
              (tecla 9).
            </p>
          </div>

          <DialogPrimitive.Close data-slot="dialog-close" asChild>
            <Button
              variant="ghost"
              className="absolute top-2 right-2"
              size="icon-sm"
              data-cuelume-press
              data-cuelume-release
            >
              <XIcon />
              <span className="sr-only">Cerrar</span>
            </Button>
          </DialogPrimitive.Close>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-foreground dark:border-ring"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -my-1.5 border-y-6 border-foreground dark:border-ring"
          />
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
