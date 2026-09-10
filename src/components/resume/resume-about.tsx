import { ResumeSection } from "@/components/resume/resume-section"
import { useResumeContent } from "@/lib/use-resume-content"

export function ResumeAbout() {
  const { resume, labels } = useResumeContent()

  return (
    <ResumeSection title={labels.summary}>
      <p className="font-sans text-xs leading-relaxed">{resume.summary}</p>
    </ResumeSection>
  )
}
