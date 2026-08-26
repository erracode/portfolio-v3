import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { bind } from "cuelume"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
)

// Delegated listeners for every data-cuelume-* element in the document —
// safe to call once at boot, keeps working as React mounts/unmounts nodes.
bind()
