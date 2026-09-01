import type { Skill } from "@/data/skills";
import { skills } from "@/data/skills";

// Pixel frame copied from the 8bitcn Card recipe: border-y on the element,
// plus a border-x overlay pulled wider (-mx-1.5) so the corners step outward.
// Image uses the chapter-intro technique (absolute inset-0, object-contain).
function SkillIcon({ skill }: { skill: Skill }) {
  return (
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
  );
}

const COLUMNS = 10;

export function BuffBar() {
  return (
    <nav
      aria-label="Tech buff icons"
      className="fixed top-4 right-4 z-40 grid max-w-[calc(100svw-2rem)] gap-2"
      style={{ gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))` }}
    >
      {skills.map((skill) => (
        <SkillIcon key={skill.id} skill={skill} />
      ))}
    </nav>
  );
}
