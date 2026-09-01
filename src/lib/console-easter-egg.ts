/** A little something for anyone curious enough to open devtools — loosely
 * inspired by bruno-simon.com's own console greeting, in this site's own
 * voice rather than copying his (his uses hand-built ASCII banner art from
 * his own toolchain; this uses `%c` console styling instead — easier to
 * get right without a figlet-style tool, and reads as its own thing). */
export function logConsoleGreeting() {
  const title = "font-size: 20px; font-weight: bold; color: #ffd100; font-family: monospace;"
  const subtitle = "font-size: 12px; color: #9ca3af;"
  const label = "font-weight: bold;"
  const link = "color: #60a5fa;"
  const dim = "font-size: 11px; color: #6b7280;"

  console.log("%cJESÚS DÍAZ", title)
  console.log("%cFull-Stack Engineer — hecho con React, Three.js y demasiado café", subtitle)
  console.log(" ")
  console.log("%c¿Curioseando el código? Me gusta esa actitud.", "font-size: 13px;")
  console.log("%cGitHub   → %chttps://github.com/erracode", label, link)
  console.log("%cLinkedIn → %chttps://www.linkedin.com/in/jesus-diaz-erracode", label, link)
  console.log("%cEmail    → %cjdiaz.97ma@gmail.com", label, link)
  console.log(" ")
  console.log(
    "%cStack: React 19 · TypeScript · Three.js / react-three-fiber · Tailwind v4 · Zustand",
    dim
  )
}
