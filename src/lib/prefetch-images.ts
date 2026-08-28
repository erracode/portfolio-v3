/**
 * Images used inside the micro-menu windows (company logos, project
 * screenshots, the player sprite sheet) that aren't already warmed up by
 * something always on screen (tech logos already covered by BuffBar are
 * skipped). Without this, each window's first-ever open in a session pays
 * a real network fetch + decode cost for its own images — felt as "this
 * specific window is slow the first time, fast after."
 */
const PREFETCH_IMAGES: readonly string[] = [
  // WorkLogModal — employer logos
  "/companies/sundevs-logo.png",
  "/companies/awsh-logo.jpg",
  "/companies/studio-logo.png",
  // WorkLogModal — work item screenshots
  "/projects/hui-wordpress-1.png",
  "/projects/app-reconciler-1.png",
  "/projects/awsh-ecommerce-1.png",
  "/projects/bot-scraper-1.png",
  "/projects/eliason-law-1.png",
  "/projects/studio73-1.png",
  "/projects/catatumbo-tech-1.png",
  "/projects/everything-websites-1.png",
  "/projects/kaironyx-logo.webp",
  // WorkLogModal — personal project logos (Save Slots previews)
  "/projects/aquetienda-logo.webp",
  "/projects/petsosciety-logo.webp",
  "/projects/aquetasa-logo.webp",
  "/projects/point-party-logo.webp",
  // SocialModal
  "/tech/github-logo.png",
  "/social/linkedin-logo.png",
  // CharacterSheetModal — the idle sprite sheet
  "/game/player.png",
  // 3D world — the NPC's idle sprite sheet (always visible on load)
  "/avatar/me.png",
  // 3D world — the zeppelin's animation sheet (always visible on load)
  "/game/contact-sprite.png",
  // 3D world — the ground tile texture (always visible on load)
  "/textures/ground-dirt-2.png",
  // 3D world — the flag prop's wave animation sheet
  "/props/flag.png",
]

/**
 * Fires off a background fetch+decode for every micro-menu image, so the
 * browser's HTTP/image cache is already warm by the time the user opens a
 * window. Safe to call once at app start: `new Image()` instances aren't
 * attached to the DOM, so there's nothing to clean up or leak.
 */
export function prefetchMicroMenuImages(): void {
  for (const src of PREFETCH_IMAGES) {
    const image = new Image()
    image.src = src
  }
}
