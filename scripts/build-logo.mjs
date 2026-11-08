#!/usr/bin/env node
/**
 * Génère tous les fichiers du logo PXLC depuis une source unique :
 * les tracés de src/lib/logo-geometry.ts (logotype de novembre 2026,
 * copié du design system) et les couleurs de src/lib/brand-colors.ts.
 *
 *   npm run logo                  → réécrit les fichiers de public/
 *   npm run logo -- --pack <dir>  → écrit en plus le kit de marque (SVG
 *                                   et PNG à diffuser : logotype clair,
 *                                   sombre, une couleur, nom seul, avatar)
 *
 * Fichiers de public/ (committés, servis tels quels) :
 *   logo.svg          avatar carré 512 (logo du JSON-LD : Google affiche
 *                     les logos d'organisation en carré ou en rond)
 *   favicon.svg       avatar : « pxlc » blanc sur carré bleu nuit arrondi
 *   favicon.ico       16, 32 et 48 px
 *   icon-16x16.png
 *   icon-32x32.png
 *   apple-touch-icon.png  180 px, carré plein (iOS arrondit lui-même)
 *   icon-192x192.png  « maskable » : fond bleu nuit plein, nom dans la
 *   icon-512x512.png  zone sûre (cercle de 80 %) pour ne pas être rogné
 *
 * Rendu PNG par resvg (déterministe, sans navigateur).
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { Resvg } from '@resvg/resvg-js'
import {
  LOGO_AVATAR, LOGO_CLEARSPACE, LOGO_NAME, LOGOTYPE,
} from '../src/lib/logo-geometry.ts'

const ROOT = process.cwd()
const PUBLIC = join(ROOT, 'public')

// Couleurs : lues dans brand-colors.ts (source canonique) plutôt que recopiées.
const brandSrc = await readFile(join(ROOT, 'src/lib/brand-colors.ts'), 'utf8')
const hex = (key) => {
  const m = brandSrc.match(new RegExp(`\\b${key}:\\s*'(#[0-9A-Fa-f]{6})'`))
  if (!m) throw new Error(`brand-colors.ts : couleur ${key} introuvable`)
  return m[1]
}
const WHITE = hex('white')
const INK = hex('textInk')
/** Couleurs du logotype par mot : version fond clair, fond sombre, une couleur. */
const THEMES = {
  clair: { name: INK, parents: hex('tealDeep'), enfants: hex('coralDeep'), ecrans: hex('textSecondary') },
  sombre: { name: WHITE, parents: hex('cyan'), enfants: hex('coral'), ecrans: hex('textOnDarkSoft') },
  'mono-encre': { name: INK, parents: INK, enfants: INK, ecrans: INK },
  'mono-blanc': { name: WHITE, parents: WHITE, enfants: WHITE, ecrans: WHITE },
}
const NIGHT = hex('bgDark')

const n = v => Number(v.toFixed(3)).toString()
const head = (w, h, vb, label, px) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${px ? n(px) : n(w)}" height="${px ? n(px * h / w) : n(h)}" role="img" aria-label="${label}"><title>${label}</title>`

/** Logotype complet avec sa zone de protection. */
const logotypeSvg = (c) => {
  const p = LOGO_CLEARSPACE
  const w = LOGOTYPE.width + 2 * p, h = LOGOTYPE.height + 2 * p
  const b = LOGOTYPE.bar
  return head(w, h, `${n(-p)} ${n(-p)} ${n(w)} ${n(h)}`, 'pxlc — parents, enfants et les écrans')
    + `<path fill="${c.name}" d="${LOGOTYPE.name}"/>`
    + `<rect fill="${c.parents}" x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" rx="${b.rx}"/>`
    + `<path fill="${c.parents}" d="${LOGOTYPE.parents}"/>`
    + `<path fill="${c.enfants}" d="${LOGOTYPE.enfants}"/>`
    + `<path fill="${c.ecrans}" d="${LOGOTYPE.ecrans}"/></svg>\n`
}

/** Nom seul « pxlc », avec la même zone de protection. */
const nameSvg = (fill) => {
  const p = LOGO_CLEARSPACE
  const w = LOGO_NAME.width + 2 * p, h = LOGO_NAME.height + 2 * p
  return head(w, h, `${n(-p)} ${n(-p)} ${n(w)} ${n(h)}`, 'pxlc')
    + `<path fill="${fill}" d="${LOGO_NAME.d}"/></svg>\n`
}

/**
 * Avatar carré : « pxlc » blanc sur bleu nuit. `rx` = rayon du carré
 * (0 pour un carré plein, que le système d'exploitation découpe).
 */
const avatarSvg = ({ rx = LOGO_AVATAR.rx, px } = {}) => {
  const S = LOGO_AVATAR.size, a = LOGO_AVATAR.name
  const k = a.scale
  const x = (S - LOGO_NAME.width * k) / 2, y = (S - LOGO_NAME.height * k) / 2
  return head(S, S, `0 0 ${S} ${S}`, 'pxlc', px)
    + `<rect width="${S}" height="${S}" rx="${rx}" fill="${NIGHT}"/>`
    + `<g transform="translate(${n(x)} ${n(y)}) scale(${n(k)})"><path fill="${WHITE}" d="${LOGO_NAME.d}"/></g></svg>\n`
}

const png = (svg, width) => new Resvg(svg, {
  fitTo: { mode: 'width', value: width },
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
const avatar = avatarSvg()
await out(PUBLIC, 'logo.svg', avatar)
await out(PUBLIC, 'favicon.svg', avatar)

const px16 = png(avatar, 16), px32 = png(avatar, 32), px48 = png(avatar, 48)
await out(PUBLIC, 'icon-16x16.png', px16)
await out(PUBLIC, 'icon-32x32.png', px32)
await out(PUBLIC, 'favicon.ico', ico([{ size: 16, data: px16 }, { size: 32, data: px32 }, { size: 48, data: px48 }]))

// Carré plein : iOS et les icônes maskable découpent eux-mêmes. Zone sûre
// maskable = cercle de 80 % du côté (rayon 205 sur 512) ; les coins du nom
// en sont à 176 : il y tient entier sans réduction.
const square = avatarSvg({ rx: 0 })
await out(PUBLIC, 'apple-touch-icon.png', png(square, 180))
await out(PUBLIC, 'icon-192x192.png', png(square, 192))
await out(PUBLIC, 'icon-512x512.png', png(square, 512))

// ── Kit de marque (--pack <dir>) ─────────────────────────────────────────
const packIdx = process.argv.indexOf('--pack')
if (packIdx > -1) {
  const dir = process.argv[packIdx + 1]
  if (!dir) throw new Error('--pack : dossier de sortie manquant')
  await mkdir(dir, { recursive: true })
  for (const [variant, colors] of Object.entries(THEMES)) {
    const name = variant === 'clair' ? 'pxlc-logo' : variant === 'sombre' ? 'pxlc-logo-fond-sombre' : `pxlc-logo-${variant}`
    const svg = logotypeSvg(colors)
    await out(dir, `${name}.svg`, svg)
    await out(dir, `${name}-2000.png`, png(svg, 2000))
  }
  for (const [name, fill] of [['pxlc-nom', INK], ['pxlc-nom-fond-sombre', WHITE]]) {
    const svg = nameSvg(fill)
    await out(dir, `${name}.svg`, svg)
    await out(dir, `${name}-1024.png`, png(svg, 1024))
  }
  await out(dir, 'pxlc-avatar.svg', avatar)
  await out(dir, 'pxlc-avatar-1024.png', png(avatar, 1024))
}

console.log(`build-logo : ${written.length} fichiers\n  ${written.join('\n  ')}`)
