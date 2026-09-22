/**
 * Shared constants for the OG card renderer (src/lib/og-templates.ts):
 * the brand-mark geometry, kept apart from the templates so the satori
 * tree stays readable.
 */
import { BRAND_HEX } from './brand-colors'

// Logo PXLC 2026 (viewBox 0 0 100 100) : grand carré parent + petit carré
// enfant en diagonale sur la grille 3×3. Même géométrie que PxlcMark.astro.
export const MARK_RECTS = [
  { x: 2, y: 2, size: 62.66, rx: 7.5, fill: BRAND_HEX.tealDeep },
  { x: 68.67, y: 68.67, size: 29.33, rx: 3.5, fill: BRAND_HEX.coral },
] as const
