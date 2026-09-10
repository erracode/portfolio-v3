import { ResumeSection } from "@/components/resume/resume-section"
import type { ResumeWorkEntry } from "@/data/resume"
import { useResumeContent } from "@/lib/use-resume-content"

function WorkEntry({ entry }: { entry: ResumeWorkEntry }) {
  return (
    <article>
      <header className="mb-1 flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
        <h3 className="font-heading text-xs">
          {entry.role} — {entry.company}
        </h3>
        <p className="font-sans text-xs text-muted-foreground">{entry.period}</p>
      </header>
      <p className="font-sans text-xs text-muted-foreground">{entry.location}</p>
      {entry.intro && <p className="mt-2 font-sans text-xs leading-relaxed">{entry.intro}</p>}
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

export function ResumeExperience() {
  const { resume, labels } = useResumeContent()

  return (
    <ResumeSection title={labels.experience}>
      {resume.work.map((entry) => (
        <WorkEntry key={entry.company} entry={entry} />
      ))}
    </ResumeSection>
  )
}
