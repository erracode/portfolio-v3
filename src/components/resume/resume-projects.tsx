import { ResumeSection } from "@/components/resume/resume-section"
import { RESUME, type ResumeProjectEntry } from "@/data/resume"

function ProjectEntry({ project }: { project: ResumeProjectEntry }) {
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

export function ResumeProjects() {
  return (
    <ResumeSection title="Selected Projects">
      {RESUME.projects.map((project) => (
        <ProjectEntry key={project.name} project={project} />
      ))}
    </ResumeSection>
  )
}
