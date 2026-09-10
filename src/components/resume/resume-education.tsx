import { ResumeSection } from "@/components/resume/resume-section"
import { useResumeContent } from "@/lib/use-resume-content"

export function ResumeEducation() {
  const { resume, labels } = useResumeContent()

  return (
    <ResumeSection title={labels.education}>
      <p className="font-sans text-xs leading-relaxed">
        {resume.educationDegree} — {resume.education.school} ({resume.education.period})
      </p>
    </ResumeSection>
  )
}
