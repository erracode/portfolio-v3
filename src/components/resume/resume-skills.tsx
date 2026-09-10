import { ResumeSection } from "@/components/resume/resume-section"
import { RESUME } from "@/data/resume"

export function ResumeSkills() {
  return (
    <ResumeSection title="Technical Skills">
      {RESUME.skills.map((group) => (
        <div key={group.label}>
          <h3 className="mb-2 font-heading text-xs">{group.label}</h3>
          <ul className="flex flex-wrap gap-2">
            {group.items.map((item) => (
              <li
                key={item.name}
                className="flex items-center gap-1.5 border-2 border-foreground bg-background px-2 py-1 font-sans text-xs dark:border-ring"
              >
                {item.icon && <img src={item.icon} alt="" className="size-3.5 object-contain" />}
                {item.name}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </ResumeSection>
  )
}
