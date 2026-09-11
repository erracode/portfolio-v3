import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "@tanstack/react-router"
import { bind } from "cuelume"

import "./index.css"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { logConsoleGreeting } from "@/lib/console-easter-egg"
import { prefetchMicroMenuImages } from "@/lib/prefetch-images"
import { router } from "./router.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
)

// Delegated listeners for every data-cuelume-* element in the document —
// safe to call once at boot, keeps working as React mounts/unmounts nodes.
bind()

// Warm the micro-menu windows' images in the background at boot, so the
// first time each window opens doesn't also pay its own fetch+decode cost.
prefetchMicroMenuImages()

logConsoleGreeting()
