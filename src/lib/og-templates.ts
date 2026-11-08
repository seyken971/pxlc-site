/**
 * Gabarits des cartes Open Graph (1200×675, 16:9) et rendu PNG.
 *
 * Une seule carte : la carte de marque, servie sur toutes les pages par
 * l'endpoint `src/pages/og/site.png.ts` — donc rendue par Astro, disponible
 * en dev comme au build.
 *
 * Couleurs : `BRAND_HEX` (source canonique) ; tracés du logotype :
 * `logo-geometry.ts`. Polices : TTF vendorées dans `src/assets/og-fonts/`
 * (satori ne lit pas le woff2).
 */
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { BRAND_HEX } from './brand-colors'
import { LOGO_NAME, LOGOTYPE } from './logo-geometry'

const F_SANS = 'Plus Jakarta Sans'
const TAGLINE = 'Médiation numérique · Guadeloupe'

const palette = {
  bg: BRAND_HEX.ivory,
  ink: BRAND_HEX.textInk,
  accent: BRAND_HEX.tealDeep,
  muted: BRAND_HEX.textOnLight,
}

type OgNode = { type: string, props: Record<string, unknown> }

const h = (
  type: string,
  style: Record<string, unknown>,
  children: unknown,
  extra: Record<string, unknown> = {},
): OgNode => ({ type, props: { style, children, ...extra } })

const path = (d: string, fill: string): OgNode => ({ type: 'path', props: { d, fill } })

// Logotype complet, couleurs de la version fond clair. `height` en px.
const logotypeSvg = (height: number): OgNode => ({
  type: 'svg',
  props: {
    width: Math.round(height * LOGOTYPE.width / LOGOTYPE.height),
    height,
    viewBox: `0 0 ${LOGOTYPE.width} ${LOGOTYPE.height}`,
    children: [
      path(LOGOTYPE.name, BRAND_HEX.textInk),
      { type: 'rect', props: { ...LOGOTYPE.bar, fill: BRAND_HEX.tealDeep } },
      path(LOGOTYPE.parents, BRAND_HEX.tealDeep),
      path(LOGOTYPE.enfants, BRAND_HEX.coralDeep),
      path(LOGOTYPE.ecrans, BRAND_HEX.textSecondary),
    ],
  },
})

// Nom seul « pxlc », pour le filigrane. `height` en px.
const nameSvg = (height: number): OgNode => ({
  type: 'svg',
  props: {
    width: Math.round(height * LOGO_NAME.width / LOGO_NAME.height),
    height,
    viewBox: `0 0 ${LOGO_NAME.width} ${LOGO_NAME.height}`,
    children: [path(LOGO_NAME.d, BRAND_HEX.textInk)],
  },
})

// Filigrane : le nom en bas à droite, 8 % d'opacité, incliné -8° (seule rotation admise).
const watermark = (height: number, offset: number) => h('div', {
  position: 'absolute',
  right: `${offset}px`,
  bottom: `${offset}px`,
  display: 'flex',
  transform: 'rotate(-8deg)',
  opacity: 0.08,
}, [nameSvg(height)])

// ── Carte de marque ─────────────────────────────────────────────
export const siteCard = () => h('div', {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: palette.bg,
  fontFamily: F_SANS,
  padding: '64px',
}, [
  watermark(300, -70),
  h('div', { display: 'flex', flexDirection: 'column', alignItems: 'center' }, [
    logotypeSvg(190),
    h('span', {
      fontFamily: F_SANS,
      fontSize: '26px',
      fontWeight: 600,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: palette.accent,
      marginTop: '48px',
    }, TAGLINE),
  ]),
])

// Polices chargées une fois par process de build.
let fontsPromise: Promise<{ name: string, weight: 600 | 700, style: 'normal', data: Buffer }[]> | null = null
const fonts = () => {
  fontsPromise ??= (async () => {
    const dir = join(process.cwd(), 'src', 'assets', 'og-fonts')
    return [
      { name: F_SANS, weight: 600 as const, style: 'normal' as const, data: await readFile(join(dir, 'PlusJakartaSans-SemiBold.ttf')) },
      { name: F_SANS, weight: 700 as const, style: 'normal' as const, data: await readFile(join(dir, 'PlusJakartaSans-Bold.ttf')) },
    ]
  })()
  return fontsPromise
}

/** Rend un gabarit en PNG 1200×675 (16:9, le ratio des aperçus sociaux). */
export const renderOgPng = async (tree: OgNode): Promise<Buffer> => {
  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], {
    width: 1200,
    height: 675,
    fonts: await fonts(),
  })
  return Buffer.from(new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng())
}
