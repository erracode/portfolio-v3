import { createRootRoute, createRoute, createRouter, redirect, Outlet } from "@tanstack/react-router"

import { App } from "@/App"
import { ResumePage } from "@/components/resume/resume-page"

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  // The resume page used to live at `/?resume` (a query flag, not its own
  // path) — kept as a one-time redirect so old bookmarks/links still land
  // on `/resume` instead of the game.
  // Must be idempotent: re-validating this function's own previous output
  // (which the router does) has to reach a stable fixed point. Returning
  // `{ resume: undefined }` for the false case looked right but wasn't —
  // the key still EXISTS with that value, so `"resume" in search` reads
  // true on the next pass even though nothing in the URL ever asked for
  // it, permanently flipping every visit to "/" into a redirect loop
  // target. Omitting the key entirely for the false case fixes that.
  validateSearch: (search: Record<string, unknown>): { resume?: true } =>
    "resume" in search ? { resume: true } : {},
  beforeLoad: ({ search }) => {
    if (search.resume) throw redirect({ to: "/resume" })
  },
  component: App,
})

const resumeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/resume",
  component: ResumePage,
})

const routeTree = rootRoute.addChildren([indexRoute, resumeRoute])

export const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
