import type { ReactNode } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/8bit/card"

/** Shared frame every section sits in — the site's own `Card` (same
 * pixelated border every window already uses), not draggable: the resume
 * reads top-to-bottom like a normal page, not a floating window.
 * `break-inside-avoid` keeps a section from splitting across a page
 * boundary when printed. */
export function ResumeSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="break-inside-avoid print:border print:border-black print:bg-white">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">{children}</CardContent>
    </Card>
  )
}
