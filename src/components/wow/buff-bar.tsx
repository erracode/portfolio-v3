import type { Skill } from "@/data/skills";
import { skills } from "@/data/skills";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/8bit/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/8bit/tooltip";

// Pixel frame copied from the 8bitcn Card recipe: border-y on the element,
// plus a border-x overlay pulled wider (-mx-1.5) so the corners step outward.
// Image uses the chapter-intro technique (absolute inset-0, object-contain).
function SkillIcon({ skill }: { skill: Skill }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative size-11 border-y-6 border-foreground bg-card p-0 dark:border-ring">
          <img
            src={skill.icon}
            alt={skill.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-contain p-1"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-inherit"
          />
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" font="normal" className="text-[10px]">
        {skill.name}
      </TooltipContent>
    </Tooltip>
  );
}

const STACK_PREVIEW_COUNT = 2;

/** Same bordered footprint as `SkillIcon` so it sits in the row without
 * looking like an outlier, but its content is two overlapping mini-icons +
 * a "+N" badge instead of one full logo — opens the rest of the stack list
 * on click, mirroring `MobileBuffBar`'s collapsed-trigger pattern. */
function SkillStackTrigger({ overflow }: { overflow: readonly Skill[] }) {
  const preview = overflow.slice(0, STACK_PREVIEW_COUNT);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Más tecnologías (${overflow.length})`}
          className="relative flex size-11 flex-col items-center justify-center gap-0.5 border-y-6 border-foreground bg-card dark:border-ring"
          data-cuelume-toggle
        >
          <span className="flex items-center">
            {preview.map((skill, index) => (
              <img
                key={skill.id}
                src={skill.icon}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className={`size-4 shrink-0 object-contain [image-rendering:pixelated] ${index === 0 ? "" : "-ml-1.5"}`}
              />
            ))}
          </span>
          <span className="retro text-[8px] leading-none">+{overflow.length}</span>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-inherit"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom" className="w-56">
        {overflow.map((skill) => (
          <DropdownMenuItem
            key={skill.id}
            className="gap-2 text-[11px]"
            data-cuelume-press
            data-cuelume-release
          >
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
  );
}

export function BuffBar() {
  const featured = skills.filter((skill) => skill.featured);
  const overflow = skills.filter((skill) => !skill.featured);

  return (
    <TooltipProvider delayDuration={200}>
      <nav
        aria-label="Tech buff icons"
        className="fixed top-4 right-4 z-40 flex max-w-[calc(100svw-2rem)] flex-row-reverse flex-wrap gap-2"
      >
        {overflow.length > 0 && <SkillStackTrigger overflow={overflow} />}
        {featured.map((skill) => (
          <SkillIcon key={skill.id} skill={skill} />
        ))}
      </nav>
    </TooltipProvider>
  );
}
