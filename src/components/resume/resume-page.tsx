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
 * instead of the WoW HUD/3D world. Routed at `/resume` (see `router.tsx`) —
 * `public/_redirects` gives Cloudflare Pages a SPA fallback so that path
 * survives a hard refresh.
 *
 * Organized like midudev's minimalist-portfolio-json reference (one section
 * per file, Cmd+K command palette) rather than one big component.
 */
export function ResumePage() {
  return (
    <div className="min-h-screen bg-background pb-20 text-foreground print:bg-white print:text-black print:pb-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12 print:gap-4 print:py-4">
        <ResumeHero />
        <ResumeAbout />
        <ResumeExperience />
        <ResumeEducation />
        <ResumeProjects />
        <ResumeSkills />
      </div>

      <ResumeCommandPalette />
    </div>
  )
}
