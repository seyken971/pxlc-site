/**
 * PXLC brand palette — canonical source.
 *
 * Used by build-time renderers (OG card rendered by satori + resvg in
 * src/lib/og-templates.ts) that can't resolve CSS custom properties at
 * runtime. Also the source of truth for the same palette in
 * src/styles/tokens.css — the
 * `--pxlc-*` block between BRAND HEX START / END markers is regenerated
 * from this file by scripts/generate-tokens.mjs (runs on prebuild and
 * via `npm run gen:tokens`).
 *
 * Edit values here, then either run `npm run gen:tokens` or just rebuild
 * — tokens.css will pick up the changes.
 */
export const BRAND_HEX = {
  // Teal scale
  tealDeep: '#036E73',
  tealMid: '#01A09D',
  cyan: '#00D2C8',

  // Accent
  coral: '#FF5E3A',
  coralDeep: '#E8492A',
  coralDeepDark: '#FF7A5C',

  // Tinted grounds (design system PXLC 2026) — badges parent / child.
  tealSoft: '#DCEFED',
  tealSoftDark: '#0F3D48',
  coralSoft: '#FFE3DA',
  coralSoftDark: '#3A1D17',

  // Surfaces
  bgLight: '#EAF6F4',
  bgDark: '#082B36',
  bgDarkSoft: '#0C3340',
  bgDarkDeep: '#06212A',
  ivory: '#F4F1EA',
  ivorySoft: '#EBE6DA',

  // Text
  textInk: '#082B36',
  textOnLight: '#2C4751',
  textSecondary: '#5A6B70',
  textOnDarkSoft: '#A9C8D0',
  textQuietDark: '#8A9DA3',

  // Borders
  border: '#C4D1D2',
  borderSoft: '#D9D2BF',
  borderDark: '#103847',
  borderDark2: '#1F4A59',
  white: '#FFFFFF',

  // Pattern colours — used in blog card thumbnail gradients.
  patternWarm: '#D6CEBD',
  patternWarmDeep: '#CDC4B0',
} as const

export type BrandHex = typeof BRAND_HEX
