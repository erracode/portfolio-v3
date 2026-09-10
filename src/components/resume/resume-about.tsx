import { ResumeSection } from "@/components/resume/resume-section"
import { RESUME } from "@/data/resume"

export function ResumeAbout() {
  return (
    <ResumeSection title="Summary">
      <p className="font-sans text-xs leading-relaxed">{RESUME.summary}</p>
    </ResumeSection>
  )
}
