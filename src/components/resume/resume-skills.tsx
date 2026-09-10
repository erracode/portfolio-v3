import { ResumeSection } from "@/components/resume/resume-section"
import { RESUME } from "@/data/resume"

export function ResumeSkills() {
  return (
    <ResumeSection title="Technical Skills">
      {RESUME.skills.map((group) => (
        <p key={group.label} className="font-sans text-xs leading-relaxed">
          <span className="font-bold">{group.label}:</span> {group.items}
        </p>
      ))}
    </ResumeSection>
  )
}
