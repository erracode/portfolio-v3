import type { Skill } from "@/data/skills"
import { skills } from "@/data/skills"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/8bit/dropdown-menu"

const PREVIEW_COUNT = 2

function PreviewIcon({ skill, isFirst }: { skill: Skill; isFirst: boolean }) {
  return (
    <img
      src={skill.icon}
      alt=""
      aria-hidden="true"
      loading="lazy"
      className={`size-6 shrink-0 bg-card object-contain p-0.5 [image-rendering:pixelated] ${
        isFirst ? "" : "-ml-2"
      }`}
    />
  )
}

/** Compact collapsed trigger (first two skill icons, slightly overlapping,
 * plus a "+N" badge) that expands into a dropdown listing every skill —
 * replaces the old single-row strip. That strip was `fixed top-2 right-2`
 * with no explicit width, so it shrink-to-fit sized itself as wide as its
 * ~10 icons needed and overlapped `MobileUnitFrames` (`fixed top-2 left-2`)
 * in the same top band. This trigger's box is bounded by its own content
 * (two small icons + a short badge), so it can't grow with the skill list.
 * Mirrors `MicroBar`'s mobile branch (`Toggle`-style trigger +
 * `@8bitcn/dropdown-menu`). */
export function MobileBuffBar() {
  const preview = skills.slice(0, PREVIEW_COUNT)
  const restCount = skills.length - preview.length

  return (
    <div className="fixed top-3 right-3 z-40">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Tecnologías (${skills.length})`}
            className="relative flex items-center gap-1 border-y-4 border-foreground bg-card px-2 py-1.5 dark:border-ring"
          >
            <span className="flex items-center">
              {preview.map((skill, index) => (
                <PreviewIcon key={skill.id} skill={skill} isFirst={index === 0} />
              ))}
            </span>
            {restCount > 0 && (
              <span className="retro text-xs leading-none">+{restCount}</span>
            )}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -mx-1 border-x-4 border-inherit"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom">
          {skills.map((skill) => (
            <DropdownMenuItem key={skill.id} className="gap-2 text-xs">
              <img
                src={skill.icon}
                alt=""
                aria-hidden="true"
                className="size-4 object-contain [image-rendering:pixelated]"
              />
              {skill.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
