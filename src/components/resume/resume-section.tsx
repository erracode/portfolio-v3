import type { ReactNode } from "react"

/** Plain section — no card/background, just a heading with a thin
 * underline and the content below. `break-inside-avoid` keeps a section
 * from splitting across a page boundary when printed. */
export function ResumeSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="break-inside-avoid">
      <h2 className="mb-4 border-b-2 border-foreground/30 pb-2 text-sm dark:border-ring/30">
        {title}
      </h2>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  )
}
