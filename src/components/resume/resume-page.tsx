import type { ReactNode } from "react"

import { Button } from "@/components/ui/8bit/button"
import { RESUME } from "@/data/resume"

/** Shared card frame every section sits in — same pixelated-border recipe
 * the rest of the site's windows use (`WowDraggableWindow`, `HelpModal`),
 * just not draggable: this page reads top-to-bottom like a normal resume,
 * not a floating window. `break-inside-avoid` keeps a section from
 * splitting across a page boundary when printed. */
function ResumeSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="break-inside-avoid border-y-4 border-x-4 border-foreground bg-card p-6 dark:border-ring print:border print:border-black print:bg-white">
      <h2 className="mb-4 text-sm">{title}</h2>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  )
}

function WorkEntry({ entry }: { entry: (typeof RESUME.work)[number] }) {
  return (
    <article>
      <header className="mb-1 flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
        <h3 className="font-heading text-xs">
          {entry.role} — {entry.company}
        </h3>
        <p className="font-sans text-xs text-muted-foreground">{entry.period}</p>
      </header>
      <p className="font-sans text-xs text-muted-foreground">{entry.location}</p>
      {entry.intro && (
        <p className="mt-2 font-sans text-xs leading-relaxed">{entry.intro}</p>
      )}
      <ul className="mt-2 flex flex-col gap-1.5 font-sans text-xs leading-relaxed">
        {entry.highlights.map((highlight) => (
          <li key={highlight} className="flex gap-2">
            <span aria-hidden="true">-</span>
            <span>{highlight}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

function ProjectEntry({ project }: { project: (typeof RESUME.projects)[number] }) {
  return (
    <article>
      <h3 className="font-heading text-xs">
        {project.url ? (
          <a href={project.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {project.name}
          </a>
        ) : (
          project.name
        )}
      </h3>
      <p className="mt-1 font-sans text-xs leading-relaxed">{project.description}</p>
      <p className="mt-1 font-sans text-xs text-muted-foreground">{project.stack}</p>
    </article>
  )
}

/**
 * The "I don't want to play a game, just show me the resume" escape hatch —
 * a traditional, print-friendly single page reusing the same content as
 * `cv-senior-software-engineer.md`, styled with the site's pixel-art system
 * instead of the WoW HUD/3D world. Rendered by `App.tsx` in place of the
 * game when the URL carries `?resume` (a query flag, not a `/resume` path,
 * since there's no server-side rewrite configured for a SPA path route on
 * whatever static host this ends up on — a query string never hits the
 * server, so it can't 404 on a hard refresh).
 */
export function ResumePage() {
  return (
    <div className="min-h-screen bg-background text-foreground print:bg-white print:text-black">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12 print:gap-4 print:py-4">
        <div className="flex flex-wrap gap-3 print:hidden">
          <Button variant="outline" size="sm" onClick={() => { window.location.href = "/" }}>
            Back to portfolio
          </Button>
          <Button variant="default" size="sm" onClick={() => window.print()}>
            Print / Save as PDF
          </Button>
        </div>

        <header className="border-y-4 border-x-4 border-foreground bg-card p-6 dark:border-ring print:border print:border-black print:bg-white">
          <h1 className="text-lg">{RESUME.name}</h1>
          <p className="mt-2 font-sans text-xs text-muted-foreground">
            {RESUME.title} | {RESUME.tagline}
          </p>
          <p className="mt-3 font-sans text-xs text-muted-foreground">
            {RESUME.email} · <a href={RESUME.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{RESUME.linkedin}</a>
            <br />
            {RESUME.location} · {RESUME.languages}
          </p>
        </header>

        <ResumeSection title="Summary">
          <p className="font-sans text-xs leading-relaxed">{RESUME.summary}</p>
        </ResumeSection>

        <ResumeSection title="Experience">
          {RESUME.work.map((entry) => (
            <WorkEntry key={entry.company} entry={entry} />
          ))}
        </ResumeSection>

        <ResumeSection title="Selected Projects">
          {RESUME.projects.map((project) => (
            <ProjectEntry key={project.name} project={project} />
          ))}
        </ResumeSection>

        <ResumeSection title="Technical Skills">
          {RESUME.skills.map((group) => (
            <p key={group.label} className="font-sans text-xs leading-relaxed">
              <span className="font-bold">{group.label}:</span> {group.items}
            </p>
          ))}
        </ResumeSection>

        <ResumeSection title="Education">
          <p className="font-sans text-xs leading-relaxed">
            {RESUME.education.degree} — {RESUME.education.school} ({RESUME.education.period})
          </p>
        </ResumeSection>
      </div>
    </div>
  )
}
