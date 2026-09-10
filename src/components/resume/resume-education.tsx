import { ResumeSection } from "@/components/resume/resume-section"
import { RESUME } from "@/data/resume"

export function ResumeEducation() {
  return (
    <ResumeSection title="Education">
      <p className="font-sans text-xs leading-relaxed">
        {RESUME.education.degree} — {RESUME.education.school} ({RESUME.education.period})
      </p>
    </ResumeSection>
  )
}
