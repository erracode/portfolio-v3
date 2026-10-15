import { ResumeAbout } from "@/components/resume/resume-about"
import { ResumeCommandPalette } from "@/components/resume/resume-command-palette"
import { ResumeEducation } from "@/components/resume/resume-education"
import { ResumeExperience } from "@/components/resume/resume-experience"
import { ResumeHero } from "@/components/resume/resume-hero"
import { ResumeProjects } from "@/components/resume/resume-projects"
import { ResumeSkills } from "@/components/resume/resume-skills"
import { ResumeWalker } from "@/components/resume/resume-walker"
import { ResumeZergRush } from "@/components/resume/resume-zerg-rush"
import { useResumeZergStore } from "@/lib/resume-zerg-store"
import { cn } from "@/lib/utils"

/**
 * The "I don't want to play a game, just show me the resume" escape hatch —
 * a traditional, print-friendly page reusing the same content as
 * `cv-senior-software-engineer.md`, styled with the site's pixel-art system
 * instead of the WoW HUD/3D world. Routed at `/resume` (see `router.tsx`) —
 * a hard refresh is served the prerendered `dist/resume.html` (see the
 * `seoPrerender` plugin in `vite.config.ts`).
 *
 * Organized like midudev's minimalist-portfolio-json reference (one section
 * per file, Cmd+K command palette) rather than one big component.
 */
export function ResumePage() {
  const waveActive = useResumeZergStore((state) => state.waveActive)

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground print:bg-white print:text-black print:pb-4">
      {/* Inert during a zerg wave so clicks/taps only move or attack — the
          palette/locale buttons live outside this block and stay usable. */}
      <div
        inert={waveActive}
        className={cn(
          "mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12 print:gap-4 print:py-4",
          waveActive && "pointer-events-none"
        )}
      >
        <ResumeHero />
        <ResumeAbout />
        <ResumeExperience />
        <ResumeEducation />
        <ResumeProjects />
        <ResumeSkills />
      </div>

      <ResumeCommandPalette />
      <ResumeWalker />
      <ResumeZergRush />
    </div>
  )
}
