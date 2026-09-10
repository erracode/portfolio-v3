import PixelTransition from "@/components/PixelTransition"
import { Avatar } from "@/components/ui/8bit/avatar"
import { Card, CardContent } from "@/components/ui/8bit/card"
import { SpriteAnimation } from "@/components/wow/sprite-animation"
import { CONTACT_LINKS } from "@/data/sections"
import { PLAYER_SPRITE } from "@/data/sprites"
import { useResumeContent } from "@/lib/use-resume-content"

const AVATAR_SIZE = 96

/** Same social-row treatment `SocialModal` uses (real logo images from
 * `CONTACT_LINKS`, not icon-font glyphs) — reused here instead of
 * reinvented, mirroring the reference site's header social icons. */
export function ResumeHero() {
  const { resume } = useResumeContent()

  return (
    <Card className="print:border print:border-black print:bg-white">
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
          <Avatar variant="pixel" className="size-24 shrink-0">
            {/* Hover/focus flips from the real photo to the in-game
                pixel avatar — a small wink back to the portfolio this
                page is an escape hatch from. */}
            <PixelTransition
              firstContent={
                <img src={resume.photo} alt={resume.name} className="h-full w-full object-cover" />
              }
              secondContent={
                <div className="flex h-full w-full items-center justify-center bg-card">
                  <SpriteAnimation
                    src={PLAYER_SPRITE.src}
                    frameWidth={PLAYER_SPRITE.frameWidth}
                    frameHeight={PLAYER_SPRITE.frameHeight}
                    frameCount={PLAYER_SPRITE.rows.idle.frameCount}
                    sheetWidth={PLAYER_SPRITE.sheetWidth}
                    sheetHeight={PLAYER_SPRITE.sheetHeight}
                    fps={2}
                    scale={AVATAR_SIZE / PLAYER_SPRITE.frameWidth}
                    aria-label={`${resume.name} — in-game avatar`}
                  />
                </div>
              }
              gridSize={8}
              pixelColor="var(--foreground)"
              animationStepDuration={0.35}
              className="!h-full !w-full !rounded-none !border-0 !bg-transparent"
            />
          </Avatar>

          <div className="min-w-0">
            <h1 className="text-lg">{resume.name}</h1>
            <p className="mt-2 font-sans text-xs text-muted-foreground">
              {resume.title} | {resume.tagline}
            </p>
            <p className="mt-3 font-sans text-xs text-muted-foreground">
              {resume.email} ·{" "}
              <a href={resume.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {resume.linkedin}
              </a>
              <br />
              {resume.location} · {resume.languages}
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-3 sm:justify-start print:hidden">
          {CONTACT_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target={link.href.startsWith("https:") ? "_blank" : undefined}
              rel={link.href.startsWith("https:") ? "noreferrer" : undefined}
              title={link.name}
              className="flex size-9 items-center justify-center border-2 border-foreground bg-background transition-colors hover:bg-accent dark:border-ring"
            >
              {/* GitHub's mark is solid black-on-transparent (no light/dark
                  variant) — it needs its own white backing or it vanishes
                  against a dark theme's background, unlike LinkedIn's
                  self-contained badge or Email's white-stroke icon (already
                  designed for a dark surface). */}
              {link.name === "GitHub" ? (
                <span className="flex size-5 items-center justify-center rounded-full bg-white">
                  <img src={link.icon} alt="" className="size-4 object-contain" />
                </span>
              ) : (
                <img src={link.icon} alt="" className="size-5 object-contain" />
              )}
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
