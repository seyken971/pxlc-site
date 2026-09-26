#!/usr/bin/env node
/**
 * Génère tous les fichiers du logo PXLC depuis une source unique :
 * la géométrie de src/lib/mark-geometry.ts et les couleurs de
 * src/lib/brand-colors.ts.
 *
 *   npm run logo                  → réécrit les fichiers de public/
 *   npm run logo -- --pack <dir>  → écrit en plus le kit de marque (SVG
 *                                   et PNG à diffuser : logo seul et avec
 *                                   le nom, clair, sombre, une couleur)
 *
 * Fichiers de public/ (committés, servis tels quels) :
 *   logo.svg          logo couleur avec sa zone de protection (JSON-LD)
 *   favicon.svg       onglet ; parent en cyan si le navigateur est en sombre
 *   favicon.ico       16, 32 et 48 px
 *   icon-16x16.png    dessinés au pixel (coordonnées entières, bords nets)
 *   icon-32x32.png
 *   apple-touch-icon.png  180 px, fond ivoire opaque (iOS remplit le
 *                         transparent en noir)
 *   icon-192x192.png  « maskable » : fond ivoire plein, logo dans la zone
 *   icon-512x512.png  sûre (cercle de 80 %) pour ne pas être rogné
 *
 * Rendu PNG par resvg (déterministe, sans navigateur) ; texte du nom
 * vectorisé par satori avec la police vendorée de la carte OG.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import {
  MARK_CHILD, MARK_CLEARSPACE, MARK_PARENT, MARK_PIXEL_GRID, MARK_VIEWBOX,
} from '../src/lib/mark-geometry.ts'

const ROOT = process.cwd()
const PUBLIC = join(ROOT, 'public')

// Couleurs : lues dans brand-colors.ts (source canonique) plutôt que recopiées.
const brandSrc = await readFile(join(ROOT, 'src/lib/brand-colors.ts'), 'utf8')
const hex = (key) => {
  const m = brandSrc.match(new RegExp(`\\b${key}:\\s*'(#[0-9A-Fa-f]{6})'`))
  if (!m) throw new Error(`brand-colors.ts : couleur ${key} introuvable`)
  return m[1]
}
const COLOR = {
  parent: hex('tealDeep'),
  parentOnDark: hex('cyan'),
  child: hex('coral'),
  ink: hex('textInk'),
  ivory: hex('ivory'),
  bgDark: hex('bgDark'),
  white: '#FFFFFF',
}

const n = v => Number(v.toFixed(3)).toString()
const rect = (r, fill) =>
  `<rect x="${n(r.x)}" y="${n(r.y)}" width="${n(r.size)}" height="${n(r.size)}" rx="${n(r.rx)}" fill="${fill}"/>`

/** Logo seul. `pad` = marge ajoutée autour du viewBox 0–100 (zone de protection). */
const markSvg = ({ parent, child, pad = 0, px = 512, title = true, extra = '' }) => {
  const min = n(-pad), side = n(MARK_VIEWBOX + 2 * pad)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="${min} ${min} ${side} ${side}" role="img" aria-label="PXLC">\n`
    + (title ? '  <title>PXLC</title>\n' : '')
    + extra
    + `  ${rect(MARK_PARENT, parent)}\n  ${rect(MARK_CHILD, child)}\n</svg>\n`
}

/** Logo posé sur un fond plein carré (icônes d'application). `scale` = part du côté occupée par le dessin (2 → 98). */
const iconSvg = (px, scale, bg) => {
  const drawn = MARK_VIEWBOX - 2 * MARK_PARENT.x // 96
  const side = drawn / scale
  const off = (side - MARK_VIEWBOX) / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="${n(-off)} ${n(-off)} ${n(side)} ${n(side)}">`
    + `<rect x="${n(-off)}" y="${n(-off)}" width="${n(side)}" height="${n(side)}" fill="${bg}"/>`
    + rect(MARK_PARENT, COLOR.parent) + rect(MARK_CHILD, COLOR.child) + '</svg>'
}

/** Favicon dessiné au pixel : viewBox = grille de pixels, coordonnées entières. */
const pixelSvg = (px) => {
  const g = MARK_PIXEL_GRID[px]
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${px} ${px}">`
    + rect(g.parent, COLOR.parent) + rect(g.child, COLOR.child) + '</svg>'
}

const png = (svg, width) => new Resvg(svg, {
  fitTo: width ? { mode: 'width', value: width } : { mode: 'original' },
  background: 'rgba(0,0,0,0)',
}).render().asPng()

/** ICO multi-tailles à images PNG embarquées (format accepté partout depuis Vista). */
const ico = (images) => {
  const header = Buffer.alloc(6 + 16 * images.length)
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(images.length, 4)
  let offset = header.length
  images.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i
    header.writeUInt8(size >= 256 ? 0 : size, e)
    header.writeUInt8(size >= 256 ? 0 : size, e + 1)
    header.writeUInt8(0, e + 2); header.writeUInt8(0, e + 3)
    header.writeUInt16LE(1, e + 4); header.writeUInt16LE(32, e + 6)
    header.writeUInt32LE(data.length, e + 8); header.writeUInt32LE(offset, e + 12)
    offset += data.length
  })
  return Buffer.concat([header, ...images.map(i => i.data)])
}

const written = []
const out = async (dir, name, data) => {
  await writeFile(join(dir, name), data)
  written.push(relative(ROOT, join(dir, name)).replaceAll('\\', '/'))
}

// ── Fichiers du site (public/) ───────────────────────────────────────────
await out(PUBLIC, 'logo.svg', markSvg({ parent: COLOR.parent, child: COLOR.child, pad: MARK_CLEARSPACE }))

// Le parent suit le thème du navigateur dans l'onglet ; l'enfant reste corail.
await out(PUBLIC, 'favicon.svg', markSvg({
  parent: COLOR.parent,
  child: COLOR.child,
  extra: `  <style>@media (prefers-color-scheme: dark) { rect:first-of-type { fill: ${COLOR.parentOnDark}; } }</style>\n`,
}))

const px16 = png(pixelSvg(16)), px32 = png(pixelSvg(32))
await out(PUBLIC, 'icon-16x16.png', px16)
await out(PUBLIC, 'icon-32x32.png', px32)
const px48 = png(markSvg({ parent: COLOR.parent, child: COLOR.child, px: 48, title: false }))
await out(PUBLIC, 'favicon.ico', ico([{ size: 16, data: px16 }, { size: 32, data: px32 }, { size: 48, data: px48 }]))

await out(PUBLIC, 'apple-touch-icon.png', png(iconSvg(180, 0.62, COLOR.ivory)))
// Zone sûre maskable : cercle de 80 % du côté ; un carré de 55 % y tient (diagonale ≈ 78 %).
await out(PUBLIC, 'icon-192x192.png', png(iconSvg(192, 0.55, COLOR.ivory)))
await out(PUBLIC, 'icon-512x512.png', png(iconSvg(512, 0.55, COLOR.ivory)))

// ── Kit de marque (--pack <dir>) ─────────────────────────────────────────
const packIdx = process.argv.indexOf('--pack')
if (packIdx > -1) {
  const dir = process.argv[packIdx + 1]
  if (!dir) throw new Error('--pack : dossier de sortie manquant')
  await mkdir(dir, { recursive: true })
  const pad = MARK_CLEARSPACE
  const variants = {
    'pxlc-logo': [COLOR.parent, COLOR.child],
    'pxlc-logo-fond-sombre': [COLOR.parentOnDark, COLOR.child],
    'pxlc-logo-mono-encre': [COLOR.ink, COLOR.ink],
    'pxlc-logo-mono-blanc': [COLOR.white, COLOR.white],
  }
  for (const [name, [parent, child]] of Object.entries(variants)) {
    const svg = markSvg({ parent, child, pad })
    await out(dir, `${name}.svg`, svg)
    await out(dir, `${name}-1024.png`, png(svg, 1024))
  }

  // Lockup : logo + « PXLC » (texte vectorisé). Proportions du composant Lockup
  // du design system : nom à 62 % du logo, espace de 33 %.
  const font = await readFile(join(ROOT, 'src/assets/og-fonts/PlusJakartaSans-Bold.ttf'))
  const M = 200
  const lockup = async (parent, text) => {
    const tree = {
      type: 'div',
      props: {
        style: { display: 'flex', alignItems: 'center', gap: `${M * 0.33}px`, width: '100%', height: '100%' },
        children: [
          {
            type: 'svg',
            props: {
              width: M, height: M, viewBox: '0 0 100 100',
              children: [
                { type: 'rect', props: { x: MARK_PARENT.x, y: MARK_PARENT.y, width: MARK_PARENT.size, height: MARK_PARENT.size, rx: MARK_PARENT.rx, fill: parent } },
                { type: 'rect', props: { x: MARK_CHILD.x, y: MARK_CHILD.y, width: MARK_CHILD.size, height: MARK_CHILD.size, rx: MARK_CHILD.rx, fill: COLOR.child } },
              ],
            },
          },
          { type: 'span', props: { style: { fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: `${M * 0.62}px`, letterSpacing: '-0.035em', color: text, lineHeight: 1 }, children: 'PXLC' } },
        ],
      },
    }
    const raw = await satori(tree, { width: 900, height: M, fonts: [{ name: 'Plus Jakarta Sans', data: font, weight: 700, style: 'normal' }] })
    // Recadre sur le dessin réel + zone de protection (un demi petit carré du logo).
    const bbox = new Resvg(raw).getBBox()
    const cs = (M / 100) * pad
    const x = bbox.x - cs, y = -cs, w = bbox.x + bbox.width + cs - x, h = M + 2 * cs
    return raw.replace(/<svg([^>]*)width="900" height="200" viewBox="0 0 900 200"/,
      `<svg$1width="${n(w)}" height="${n(h)}" viewBox="${n(x)} ${n(y)} ${n(w)} ${n(h)}" role="img" aria-label="PXLC"`)
  }
  for (const [name, parent, text] of [
    ['pxlc-lockup', COLOR.parent, COLOR.ink],
    ['pxlc-lockup-fond-sombre', COLOR.parentOnDark, COLOR.ivory],
  ]) {
    const svg = await lockup(parent, text)
    if (!svg.includes('aria-label="PXLC"')) throw new Error('lockup : recadrage du SVG satori impossible')
    await out(dir, `${name}.svg`, svg)
    await out(dir, `${name}-2000.png`, png(svg, 2000))
  }
}

console.log(`build-logo : ${written.length} fichiers\n  ${written.join('\n  ')}`)
