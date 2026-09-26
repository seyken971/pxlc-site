/**
 * Shared constants for the OG card renderer (src/lib/og-templates.ts):
 * the brand-mark geometry, kept apart from the templates so the satori
 * tree stays readable.
 */
import { BRAND_HEX } from './brand-colors'
import { MARK_CHILD, MARK_PARENT } from './mark-geometry'

// Logo PXLC 2026 (viewBox 0 0 100 100) : géométrie tirée de mark-geometry.ts,
// source unique partagée avec PxlcMark.astro et scripts/build-logo.mjs ;
// seules les couleurs (hex, hors contexte CSS) sont propres à la carte OG.
export const MARK_RECTS = [
  { ...MARK_PARENT, fill: BRAND_HEX.tealDeep },
  { ...MARK_CHILD, fill: BRAND_HEX.coral },
] as const
