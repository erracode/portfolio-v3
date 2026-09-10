import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/8bit/avatar"
import { Card, CardContent } from "@/components/ui/8bit/card"
import { CONTACT_LINKS } from "@/data/sections"
import { RESUME } from "@/data/resume"

/** Same social-row treatment `SocialModal` uses (real logo images from
 * `CONTACT_LINKS`, not icon-font glyphs) — reused here instead of
 * reinvented, mirroring the reference site's header social icons. */
export function ResumeHero() {
  return (
    <Card className="print:border print:border-black print:bg-white">
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
          <Avatar variant="default" className="size-24 shrink-0">
            <AvatarImage src={RESUME.photo} alt={RESUME.name} className="object-cover" />
            <AvatarFallback>{RESUME.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <h1 className="text-lg">{RESUME.name}</h1>
            <p className="mt-2 font-sans text-xs text-muted-foreground">
              {RESUME.title} | {RESUME.tagline}
            </p>
            <p className="mt-3 font-sans text-xs text-muted-foreground">
              {RESUME.email} ·{" "}
              <a href={RESUME.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {RESUME.linkedin}
              </a>
              <br />
              {RESUME.location} · {RESUME.languages}
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
