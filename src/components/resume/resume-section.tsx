import type { ReactNode } from "react"

/** Shared card frame every section sits in — same pixelated-border recipe
 * the rest of the site's windows use (`WowDraggableWindow`, `HelpModal`),
 * just not draggable: the resume reads top-to-bottom like a normal page,
 * not a floating window. `break-inside-avoid` keeps a section from
 * splitting across a page boundary when printed. */
export function ResumeSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="break-inside-avoid border-y-4 border-x-4 border-foreground bg-card p-6 dark:border-ring print:border print:border-black print:bg-white">
      <h2 className="mb-4 text-sm">{title}</h2>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  )
}
