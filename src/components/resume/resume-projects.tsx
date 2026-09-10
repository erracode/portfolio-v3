import ChapterIntro from "@/components/ui/8bit/blocks/chapter-intro"
import { ResumeSection } from "@/components/resume/resume-section"
import { PROJECTS } from "@/data/projects"

/** Same curated set as `cv-senior-software-engineer.md`'s "Selected
 * Projects" — a deliberate subset of the full `WorkLogModal` gallery, not
 * every side project. */
const FEATURED_IDS = ["aquetienda", "point-party", "petsosciety", "opencode-obsidian"]

export function ResumeProjects() {
  const projects = FEATURED_IDS.map((id) => PROJECTS.find((project) => project.id === id)).filter(
    (project) => project !== undefined
  )

  return (
    <ResumeSection title="Selected Projects">
      {projects.map((project) => (
        <article key={project.id}>
          <ChapterIntro
            title={project.name}
            subtitle={project.summary}
            backgroundSrc={project.images[0]}
            height="sm"
            align="left"
            darken={0.65}
          />
          <p className="mt-2 font-sans text-xs text-muted-foreground">
            {project.stack.join(" · ")}
            {project.liveUrl && (
              <>
                {" · "}
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Visit ↗
                </a>
              </>
            )}
          </p>
        </article>
      ))}
    </ResumeSection>
  )
}
