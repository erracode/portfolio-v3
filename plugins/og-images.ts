import fs from "node:fs"
import path from "node:path"
import { Resvg } from "@resvg/resvg-js"
import satori from "satori"
import type { Plugin } from "vite"

import { OG_IMAGES, type OgImageSpec } from "../src/seo/route-meta"

/**
 * Build-time Open Graph cards (1200x630) for "/" and "/resume", emitted
 * straight into `dist/og/` so no binary is committed. Same pipeline as
 * aquetienda's landing (`apps/landing/src/lib/og-home.ts`): satori turns a
 * plain element tree into SVG with real embedded fonts, then the
 * Node-native `@resvg/resvg-js` rasterizes it to PNG.
 *
 * Fonts come from the `@fontsource/*` packages the site already ships —
 * their `.woff` files, since satori can't read WOFF2. The avatar is the same
 * JPEG the resume uses (satori decodes PNG/JPEG, not WebP).
 */

const WIDTH = 1200
const HEIGHT = 630

// Night-sky palette matching the site's `theme-color` (#0c0f0a) plus a
// WoW-ish quest-gold accent for the pixel frames.
const BG = "#0c0f0a"
const PANEL = "#151a12"
const GOLD = "#f5c542"
const GOLD_DIM = "#8a6d1f"
const TEXT = "#f4f1e8"
const MUTED = "#a8a596"

interface El {
  type: string
  props: Record<string, unknown> & {
    style?: Record<string, unknown>
    children?: unknown
  }
}

function h(
  type: string,
  style: Record<string, unknown>,
  children?: unknown,
  extra: Record<string, unknown> = {}
): El {
  return {
    type,
    props: { style: { display: "flex", ...style }, children, ...extra },
  }
}

/** The site's 8bit frame: a top/bottom border box plus a left/right border
 * box offset outward by the border width, which leaves the corners notched
 * like the `components/ui/8bit` cards and dialogs. */
function pixelFrame(
  content: El,
  { border, color, inset }: { border: number; color: string; inset: number }
): El {
  return h("div", { position: "relative", padding: `${inset}px` }, [
    h("div", {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: `${border}px`,
      right: `${border}px`,
      borderTop: `${border}px solid ${color}`,
      borderBottom: `${border}px solid ${color}`,
    }),
    h("div", {
      position: "absolute",
      top: `${border}px`,
      bottom: `${border}px`,
      left: 0,
      right: 0,
      borderLeft: `${border}px solid ${color}`,
      borderRight: `${border}px solid ${color}`,
    }),
    content,
  ])
}

/** Decorative XP bar — 20 square cells like the retro `Progress` block. */
function xpBar(filled: number): El {
  return h(
    "div",
    {
      gap: "6px",
      padding: "6px",
      backgroundColor: "#00000055",
      border: `4px solid ${GOLD_DIM}`,
    },
    Array.from({ length: 20 }, (_, index) =>
      h("div", {
        width: "22px",
        height: "18px",
        backgroundColor: index < filled ? GOLD : "#2a2f24",
      })
    )
  )
}

function buildTree(spec: OgImageSpec, avatarDataUri: string): El {
  // The photo is a blue disc on white (disc: 668px wide, centered, in the
  // 800px source). Clip exactly to that disc so the white corners disappear
  // and the round portrait sits on the dark panel inside the pixel frame.
  const disc = 276
  const scale = disc / 668
  const imageSize = Math.round(800 * scale)
  const avatar = h(
    "div",
    {
      width: "300px",
      height: "300px",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: PANEL,
    },
    h(
      "div",
      {
        width: `${disc}px`,
        height: `${disc}px`,
        borderRadius: "9999px",
        overflow: "hidden",
        position: "relative",
      },
      h(
        "img",
        {
          position: "absolute",
          left: `${-66 * scale}px`,
          top: `${-66 * scale}px`,
        },
        undefined,
        {
          src: avatarDataUri,
          width: imageSize,
          height: imageSize,
        }
      )
    )
  )

  return h(
    "div",
    {
      width: `${WIDTH}px`,
      height: `${HEIGHT}px`,
      backgroundColor: BG,
      // Faint pixel grid, so the flat background reads as a game screen.
      backgroundImage: `linear-gradient(${PANEL} 2px, transparent 2px), linear-gradient(90deg, ${PANEL} 2px, transparent 2px)`,
      backgroundSize: "32px 32px",
      padding: "36px",
      fontFamily: "Geist Pixel",
      color: TEXT,
    },
    [
      pixelFrame(
        h(
          "div",
          {
            width: `${WIDTH - 36 * 2 - 12 * 2 - 8 * 2}px`,
            height: `${HEIGHT - 36 * 2 - 12 * 2 - 8 * 2}px`,
            backgroundColor: `${BG}e6`,
            alignItems: "center",
            padding: "0 56px",
            gap: "56px",
          },
          [
            pixelFrame(avatar, { border: 8, color: GOLD, inset: 14 }),
            h("div", { flexDirection: "column", flex: 1, gap: "22px" }, [
              h(
                "div",
                {
                  alignSelf: "flex-start",
                  fontFamily: "Press Start 2P",
                  fontSize: "18px",
                  color: BG,
                  backgroundColor: GOLD,
                  padding: "10px 14px",
                },
                spec.badge
              ),
              h(
                "div",
                {
                  fontFamily: "Press Start 2P",
                  fontSize: "50px",
                  lineHeight: 1.25,
                },
                "Jesús Díaz"
              ),
              h(
                "div",
                { fontSize: "38px", color: GOLD },
                "Senior Full-Stack Engineer"
              ),
              h(
                "div",
                { fontSize: "28px", color: MUTED, lineHeight: 1.35 },
                spec.tagline
              ),
              h(
                "div",
                { flexDirection: "column", gap: "14px", marginTop: "10px" },
                [
                  xpBar(spec.xpFilled),
                  h(
                    "div",
                    {
                      fontFamily: "Press Start 2P",
                      fontSize: "16px",
                      color: MUTED,
                    },
                    "erracode.pages.dev"
                  ),
                ]
              ),
            ]),
          ]
        ),
        { border: 8, color: GOLD, inset: 12 }
      ),
    ]
  )
}

async function renderOgImage(
  spec: OgImageSpec,
  fonts: { pressStart: Buffer; geistPixel: Buffer },
  avatar: Buffer
) {
  const avatarDataUri = `data:image/jpeg;base64,${avatar.toString("base64")}`
  // satori takes plain `{ type, props }` element objects without React; its
  // signature is typed as ReactNode, which those objects structurally are not.
  const svg = await satori(
    buildTree(spec, avatarDataUri) as unknown as Parameters<typeof satori>[0],
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        {
          name: "Press Start 2P",
          data: fonts.pressStart,
          weight: 400,
          style: "normal",
        },
        {
          name: "Geist Pixel",
          data: fonts.geistPixel,
          weight: 400,
          style: "normal",
        },
      ],
    }
  )
  return new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } })
    .render()
    .asPng()
}

export function ogImages(): Plugin {
  let root = ""

  return {
    name: "og-images",
    apply: "build",
    configResolved(config) {
      root = config.root
    },
    async generateBundle() {
      const read = (file: string) => fs.readFileSync(path.join(root, file))
      const fonts = {
        pressStart: read(
          "node_modules/@fontsource/press-start-2p/files/press-start-2p-latin-400-normal.woff"
        ),
        geistPixel: read(
          "node_modules/@fontsource/geist-pixel/files/geist-pixel-latin-400-normal.woff"
        ),
      }
      const avatar = read("public/images/jesus-diaz.jpg")

      for (const spec of Object.values(OG_IMAGES)) {
        this.emitFile({
          type: "asset",
          fileName: spec.path.replace(/^\//, ""),
          source: await renderOgImage(spec, fonts, avatar),
        })
      }
    },
  }
}
