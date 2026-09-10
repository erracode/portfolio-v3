import { Button } from "@/components/ui/8bit/button"
import { ResumeAbout } from "@/components/resume/resume-about"
import { ResumeCommandPalette } from "@/components/resume/resume-command-palette"
import { ResumeEducation } from "@/components/resume/resume-education"
import { ResumeExperience } from "@/components/resume/resume-experience"
import { ResumeHero } from "@/components/resume/resume-hero"
import { ResumeProjects } from "@/components/resume/resume-projects"
import { ResumeSkills } from "@/components/resume/resume-skills"

/**
 * The "I don't want to play a game, just show me the resume" escape hatch —
 * a traditional, print-friendly page reusing the same content as
 * `cv-senior-software-engineer.md`, styled with the site's pixel-art system
 * instead of the WoW HUD/3D world. Rendered by `App.tsx` in place of the
 * game when the URL carries `?resume` (a query flag, not a `/resume` path,
 * since there's no server-side rewrite configured for a SPA path route on
 * whatever static host this ends up on — a query string never hits the
 * server, so it can't 404 on a hard refresh).
 *
 * Organized like midudev's minimalist-portfolio-json reference (one section
 * per file, Cmd+K command palette) rather than one big component.
 */
export function ResumePage() {
  return (
    <div className="min-h-screen bg-background pb-20 text-foreground print:bg-white print:text-black print:pb-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12 print:gap-4 print:py-4">
        <div className="flex flex-wrap gap-3 print:hidden">
          <Button variant="outline" size="sm" onClick={() => { window.location.href = "/" }}>
            Back to portfolio
          </Button>
          <Button variant="default" size="sm" onClick={() => window.print()}>
            Print / Save as PDF
          </Button>
        </div>

        <ResumeHero />
        <ResumeAbout />
        <ResumeExperience />
        <ResumeProjects />
        <ResumeSkills />
        <ResumeEducation />
      </div>

      <ResumeCommandPalette />
    </div>
  )
}
