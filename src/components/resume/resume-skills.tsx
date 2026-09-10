import { useState } from "react"

import { Button } from "@/components/ui/8bit/button"
import { ResumeSection } from "@/components/resume/resume-section"
import type { ResumeSkillGroup } from "@/data/resume"
import { useResumeContent } from "@/lib/use-resume-content"

const COLLAPSED_GROUP_COUNT = 2

function SkillGroup({ group }: { group: ResumeSkillGroup }) {
  return (
    <div>
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
  )
}

export function ResumeSkills() {
  const { resume, labels } = useResumeContent()
  const [expanded, setExpanded] = useState(false)

  const visibleGroups = expanded ? resume.skills : resume.skills.slice(0, COLLAPSED_GROUP_COUNT)
  const hasMore = resume.skills.length > COLLAPSED_GROUP_COUNT

  return (
    <ResumeSection title={labels.skills}>
      {visibleGroups.map((group) => (
        <SkillGroup key={group.label} group={group} />
      ))}

      {hasMore && (
        <Button variant="outline" size="sm" onClick={() => setExpanded((current) => !current)} className="self-start">
          {expanded ? labels.showLess : labels.showMore}
        </Button>
      )}
    </ResumeSection>
  )
}
