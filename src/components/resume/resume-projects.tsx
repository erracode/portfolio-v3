import { Card, CardContent } from "@/components/ui/8bit/card"
import { ResumeSection } from "@/components/resume/resume-section"
import { PROJECTS, type ProjectEntry } from "@/data/projects"
import { useResumeContent } from "@/lib/use-resume-content"

/** Same curated set as `cv-senior-software-engineer.md`'s "Selected
 * Projects" — a deliberate subset of the full `WorkLogModal` gallery, not
 * every side project. */
const FEATURED_IDS = ["aquetienda", "point-party", "petsosciety", "aquetasa", "opencode-obsidian"]

function ProjectCard({ project, summary, visitLabel }: { project: ProjectEntry; summary: string; visitLabel: string }) {
  const thumbnail = project.logo ?? project.images[0]

  const card = (
    <Card className="h-full transition-transform group-hover:-translate-y-0.5">
      <CardContent className="flex h-full flex-col gap-3">
        {thumbnail && (
          <img
            src={thumbnail}
            alt=""
            className="h-28 w-full border-2 border-foreground object-cover dark:border-ring"
          />
        )}
        <div>
          <h3 className="font-heading text-xs">{project.name}</h3>
          <p className="mt-1 font-sans text-xs leading-relaxed text-muted-foreground">{summary}</p>
        </div>
        <ul className="mt-auto flex flex-wrap gap-1.5">
          {project.stack.map((tech) => (
            <li key={tech} className="border border-foreground/40 px-1.5 py-0.5 font-sans text-[10px] dark:border-ring/40">
              {tech}
            </li>
          ))}
        </ul>
        {project.liveUrl && (
          <p className="font-sans text-xs font-bold group-hover:underline">{visitLabel} ↗</p>
        )}
      </CardContent>
    </Card>
  )

  if (!project.liveUrl) return card

  return (
    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="group block">
      {card}
    </a>
  )
}

export function ResumeProjects() {
  const { locale, labels } = useResumeContent()
  const projects = FEATURED_IDS.map((id) => PROJECTS.find((project) => project.id === id)).filter(
    (project) => project !== undefined
  )

  return (
    <ResumeSection title={labels.projects}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            summary={locale === "es" ? project.summary : project.summaryEn}
            visitLabel={labels.visit}
          />
        ))}
      </div>
    </ResumeSection>
  )
}
