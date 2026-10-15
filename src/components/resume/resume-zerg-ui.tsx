import { useRef } from "react"

import { Button } from "@/components/ui/8bit/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/8bit/dialog"
import { Progress } from "@/components/ui/8bit/progress"
import { useResumeContent } from "@/lib/use-resume-content"
import { cn } from "@/lib/utils"

export type ZergWaveOutcome = "cleared" | "defeated"

export interface ZergWaveResult {
  outcome: ZergWaveOutcome
  kills: number
  hpLeft: number
  maxHp: number
}

/** 7x6 pixel heart, one `<rect>` per lit pixel so it stays crisp at any
 * size instead of relying on an icon font or a raster sprite. */
const HEART_PIXELS = [
  ".XX.XX.",
  "XXXXXXX",
  "XXXXXXX",
  ".XXXXX.",
  "..XXX..",
  "...X...",
]

function PixelHeart({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 7 6"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={cn(
        "size-6 transition-[color,transform] duration-200 sm:size-7",
        filled ? "text-red-500" : "scale-90 text-muted-foreground/30"
      )}
    >
      {HEART_PIXELS.flatMap((row, y) =>
        [...row].map((pixel, x) =>
          pixel === "X" ? (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill="currentColor"
            />
          ) : null
        )
      )}
    </svg>
  )
}

interface ZergHudProps {
  hp: number
  maxHp: number
  kills: number
  waveSize: number
  isTouch: boolean
}

/**
 * In-wave HUD for the `/resume` zerg rush: pixel hearts for HP, a retro
 * progress bar for kills and the control hint. Pinned bottom-center (the
 * "Ctrl/Cmd + K" hint hides itself during a wave to free that slot), so it
 * never covers the hero name at the top of the page. Purely informational
 * — `pointer-events-none` so it can't swallow a walk/throw tap.
 */
export function ZergHud({ hp, maxHp, kills, waveSize, isTouch }: ZergHudProps) {
  const { labels } = useResumeContent()

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 left-1/2 z-30 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 border-y-6 border-foreground bg-card text-card-foreground shadow-lg dark:border-ring print:hidden"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -mx-1.5 border-x-6 border-inherit"
      />

      <div className="relative flex flex-col gap-3 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <span className="retro text-[0.65rem] tracking-wider text-primary uppercase sm:text-xs">
            {labels.zergHudTitle}
          </span>
          <div
            className="flex items-center gap-1"
            title={`${labels.zergHp}: ${hp}/${maxHp}`}
          >
            <span className="sr-only">
              {labels.zergHp}: {hp}/{maxHp}
            </span>
            {Array.from({ length: maxHp }, (_, index) => (
              <PixelHeart key={index} filled={index < hp} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3 font-sans text-xs sm:text-sm">
            <span className="text-muted-foreground">{labels.zergKills}</span>
            <span className="retro text-xs tabular-nums sm:text-sm">
              {kills}/{waveSize}
            </span>
          </div>
          <Progress
            value={(kills / waveSize) * 100}
            variant="retro"
            progressBg="bg-primary"
            className="h-3"
          />
        </div>

        <p className="font-sans text-xs text-muted-foreground sm:text-sm">
          {isTouch ? labels.zergHintTouch : labels.zergHintPointer}
        </p>
      </div>
    </div>
  )
}

interface ZergResultDialogProps {
  /** Kept after closing so the panel doesn't empty out mid fade-out. */
  result: ZergWaveResult | null
  open: boolean
  waveSize: number
  onPlayAgain: () => void
  onClose: () => void
}

/**
 * End-of-wave result, replacing the old toast. A Radix dialog portaled to
 * `<body>`, so it sits outside `ResumePage`'s inert content wrapper and stays
 * clickable; Esc, the overlay, the X and "Close" all dismiss it.
 *
 * Initial focus goes to the dialog panel itself, not to "Play again": the
 * wave usually ends while the player is hammering Space to throw, and a
 * focused button would turn that very keypress into an instant restart.
 */
export function ZergResultDialog({
  result,
  open,
  waveSize,
  onPlayAgain,
  onClose,
}: ZergResultDialogProps) {
  const { labels } = useResumeContent()
  const contentRef = useRef<HTMLDivElement>(null)
  const victory = result?.outcome === "cleared"

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        ref={contentRef}
        tabIndex={-1}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          contentRef.current?.focus()
        }}
        className="gap-5 text-center sm:max-w-md print:hidden"
      >
        {result && (
          <>
            <DialogHeader className="items-center gap-3 text-center">
              <div className="flex items-center gap-1" aria-hidden="true">
                {Array.from({ length: result.maxHp }, (_, index) => (
                  <PixelHeart key={index} filled={index < result.hpLeft} />
                ))}
              </div>
              <DialogTitle
                className={cn(
                  "text-lg leading-relaxed sm:text-xl",
                  victory ? "text-primary" : "text-red-500"
                )}
              >
                {victory ? labels.zergVictoryTitle : labels.zergDefeatTitle}
              </DialogTitle>
              <DialogDescription className="font-sans text-sm text-balance">
                {victory ? labels.zergVictoryText : labels.zergDefeatText}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3 font-sans text-sm">
                <span className="text-muted-foreground">
                  {labels.zergKills}
                </span>
                <span className="retro text-sm tabular-nums">
                  {result.kills}/{waveSize}
                </span>
              </div>
              <Progress
                value={(result.kills / waveSize) * 100}
                variant="retro"
                progressBg={victory ? "bg-primary" : "bg-red-500"}
                className="h-4"
              />
            </div>

            <DialogFooter className="gap-4 sm:justify-center">
              <Button
                variant="outline"
                onClick={onClose}
                data-cuelume-press
                data-cuelume-release
              >
                {labels.zergClose}
              </Button>
              <Button
                onClick={onPlayAgain}
                data-cuelume-press
                data-cuelume-release
              >
                {labels.zergPlayAgain}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
