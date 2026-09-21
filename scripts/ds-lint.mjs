#!/usr/bin/env node
/**
 * scripts/ds-lint.mjs
 * Design-system compliance linter.
 *
 * Scanne src/components, src/pages, src/layouts (.astro et .vue) ainsi que
 * src/styles/styles.css (règles <style> uniquement) à la recherche
 * de violations du design system PXLC et quitte avec code 1
 * (build annulé) si au moins une violation est trouvée.
 * tokens.css est exempté — c'est la source des valeurs littérales.
 * fonts.css est exempté — @font-face extraites verbatim, sans couleur.
 *
 * Usage :
 *   node scripts/ds-lint.mjs
 *   npm run ds-lint
 *
 * Règles :
 *   R1 hex-brut       — #RRGGBB / #RGB dans <style> → utiliser var(--pxlc-*)
 *   R2 gradient       — linear/radial-gradient interdits
 *   R3 font-famille   — "Sora", "DM Sans", "JetBrains Mono" hardcodés
 *   R4 radius-brut    — border-radius > 2 px sans var(--radius-*)
 *   R5 vocab-interdit — termes bannis dans <template>
 *   R6 emoji          — emoji interdits dans <template>
 *   R7 seo-longueur   — title/description des objets `const seo = {…}` des
 *                       pages trop longs, et SITE.description de
 *                       src/config/site.ts
 *   R8 rgba-brut      — rgba()/rgb() dans <style> → utiliser un token
 *                       (radial-gradient reste autorisé, mais sa couleur
 *                       doit être un token, ex. var(--dot-grid))
 *   R9 ease-brut      — cubic-bezier() brut → utiliser var(--ease-step)
 *                       (les durées ne sont pas lintées : les delays de
 *                       chorégraphie hors échelle sont légitimes)
 *   R10 nommage       — composants app/components en PascalCase, deux
 *                       mots minimum (style guide Vue)
 *   R11 nbsp-manquante— espace ASCII avant ? ! : ; » / après « / nombre +
 *                       unité-symbole (h, min, €, %) → insécable manquante
 *   R12 phrase-interdite— garde-fous factuels (ex. « intervenants culturels »
 *                       au pluriel) balayés sur .astro/.ts sous src/
 *
 * Plaquette : c'est une page du site (src/pages/plaquette.astro), couverte
 * comme tout .astro. Le PDF committé n'étant jamais rebuild par la CI, c'est
 * la source qui est gardée.
 *
 * Corrections v2 :
 *   - parseSfc : tous les blocs <style> sont capturés (matchAll, pas match)
 *   - lintStyle : regexes sur raw — m.index == position réelle → lineAt correct
 *   - R1 : sélecteurs CSS id ignorés (# sans ':' sur la même ligne)
 *   - walk : seul ENOENT est swallowé — les autres erreurs fs sont propagées
 *   - FORBIDDEN : 'détox' supprimé (sous-ensemble de 'détox numérique')
 */
import { readFile, readdir } from 'node:fs/promises'
import { join, relative }   from 'node:path'
import { SEO_TITLE_MAX, SEO_DESC_MAX } from './seo-limits.mjs'

const ROOT      = process.cwd()
const SCAN_DIRS = ['src/components', 'src/pages', 'src/layouts']
const SCAN_EXTS = ['.astro']
// Feuilles CSS globales soumises aux règles couleurs brutes (R1 hex, R8 rgba).
// tokens.css est exempté : c'est la source des valeurs hex/rgba — les
// littéraux y sont légitimes, c'est partout ailleurs qu'ils sont interdits.
// R2 (gradient) ne s'applique pas ici : le fade de .section--soft::before est
// un linear-gradient volontaire (surface → transparent, pas un gradient de
// marque) ; R3/R4 restent scoppés aux composants.
const CSS_FILES = ['src/styles/styles.css']
const CSS_RULES = new Set(['hex-brut', 'rgba-brut', 'ease-brut'])

// ── Vocabulaire interdit ───────────────────────────────────────────────────────
// Classé du plus long au plus court pour éviter les faux-positifs en cas de
// sous-chaînes (ex. 'détox' ⊂ 'détox numérique' — on ne garde que le composé).
const FORBIDDEN = [
  'addiction', 'désintoxication', 'détox numérique',
  'coach', 'expert', 'innovant', 'révolutionnaire',
]

// ── File walker ───────────────────────────────────────────────────────────────
async function walk(dir, exts = ['.vue']) {
  const files = []
  let entries
  try { entries = await readdir(dir, { withFileTypes: true }) }
  catch (err) {
    // ENOENT = répertoire absent (ex. app/layouts inexistant) → OK, on skip.
    // Toute autre erreur (EACCES, EPERM…) est propagée pour ne pas masquer
    // un problème de permissions qui donnerait un faux ✓.
    if (err.code !== 'ENOENT') throw err
    return files
  }
  for (const e of entries) {
    const full = join(dir, e.name)
    if (e.isDirectory())                       files.push(...await walk(full, exts))
    else if (exts.some(x => e.name.endsWith(x))) files.push(full)
  }
  return files
}

// ── SFC / Astro parser ────────────────────────────────────────────────────────
function parseSfc(src) {
  // matchAll (avec g) capture TOUS les blocs <style> et <style scoped>.
  // Les blocs sont concaténés : les numéros de ligne restent cohérents
  // au sein de chaque bloc, avec un décalage d'une ligne entre blocs.
  const styleBlocks = [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
    .map(m => m[1])
  return {
    template: src.match(/<template[^>]*>([\s\S]*?)<\/template>/)?.[1] ?? '',
    style:    styleBlocks.join('\n'),
  }
}

function parseAstro(src) {
  // Frontmatter = premier bloc --- … --- ; le « template » est le balisage qui
  // suit, blocs <style> et <script> neutralisés (longueur préservée pour que
  // les numéros de ligne restent exacts).
  const blank = s => s.replace(/[^\n]/g, ' ')
  const fm = src.match(/^---\r?\n[\s\S]*?\r?\n---/)
  const markup = fm ? blank(fm[0]) + src.slice(fm[0].length) : src
  const styleBlocks = [...markup.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
    .map(m => m[1])
  return {
    template: markup
      .replace(/<style[^>]*>[\s\S]*?<\/style>/g, blank)
      .replace(/<script[^>]*>[\s\S]*?<\/script>/g, blank),
    style: styleBlocks.join('\n'),
  }
}

/** Retourne les plages [start, end) de tous les blocs commentaires CSS. */
function commentRanges(css) {
  const ranges = []
  for (const m of css.matchAll(/\/\*[\s\S]*?\*\//g))
    ranges.push([m.index, m.index + m[0].length])
  return ranges
}

/** Retourne true si idx est à l'intérieur d'un bloc commentaire. */
function inComment(idx, ranges) {
  return ranges.some(([s, e]) => idx >= s && idx < e)
}

/** Numéro de ligne (1-based) de l'index idx dans src. */
function lineAt(src, idx) {
  return src.slice(0, idx).split('\n').length
}

// ── Règles <style> ────────────────────────────────────────────────────────────
function lintStyle(raw, file, only = null) {
  const vs     = []
  const ranges = commentRanges(raw)

  // Les regexes tournent sur `raw` (pas sur la chaîne stripée) pour que
  // m.index corresponde toujours à la position réelle → lineAt(raw, m.index)
  // est exact. Les correspondances dans des commentaires sont filtrées via
  // inComment() plutôt qu'en supprimant physiquement les commentaires.
  // `only` (Set de noms de règles) restreint le jeu de règles — utilisé pour
  // les feuilles CSS globales où seules les règles couleur s'appliquent.
  const flag = (re, rule, msg, extra) => {
    if (only && !only.has(rule)) return
    for (const m of raw.matchAll(re)) {
      if (inComment(m.index, ranges)) continue
      if (extra && !extra(m))         continue
      vs.push({ file, rule, line: lineAt(raw, m.index), detail: msg(m) })
    }
  }

  // R1 — Hex brut
  // Le filtre `extra` détecte le contexte « valeur de propriété » en cherchant
  // un ':' entre la dernière limite de déclaration ({, }, ;) et le '#'.
  // Couvre à la fois les valeurs sur une seule ligne et les valeurs sur plusieurs
  // lignes (continuation) où le ':' est sur la ligne précédente.
  // Les sélecteurs CSS id (#facade, #abc…) n'ont jamais de ':' entre la
  // limite de déclaration et eux-mêmes → correctement ignorés.
  flag(
    /#[0-9A-Fa-f]{3,8}\b/g,
    'hex-brut',
    m => `${m[0]} → utiliser un token CSS var(--pxlc-*) ou sémantique`,
    m => {
      const before   = raw.slice(0, m.index)
      const boundary = Math.max(
        before.lastIndexOf(';'),
        before.lastIndexOf('{'),
        before.lastIndexOf('}'),
      ) + 1
      return before.slice(boundary).includes(':')
    },
  )

  // R2 — Gradient (linear-gradient et repeating-* interdits ;
  //   radial-gradient autorisé pour les textures type dot-grid)
  flag(
    /(repeating-linear|repeating-radial|linear)-gradient/g,
    'gradient',
    m => `${m[0]}(...) → les gradients linéaires et repeating sont interdits par le DS`,
  )

  // R3 — Font-family hardcodée
  flag(
    /"(Sora|DM Sans|JetBrains Mono)"/g,
    'font-famille-brut',
    m => `${m[0]} → utiliser var(--font-display|body|mono)`,
  )

  // R4 — border-radius hardcodé > 2 px (1 px et 2 px : micro-détails autorisés)
  flag(
    /border-radius\s*:[^\n;]*\b([3-9]\d*|[1-9]\d+)px/g,
    'radius-brut',
    m => `${m[0].trim()} → utiliser var(--radius-xs|sm|md|lg|xl|pill)`,
  )

  // R8 — rgba()/rgb() brut (continuité de R1 : les alphas dérivent aussi)
  flag(
    /\brgba?\(/g,
    'rgba-brut',
    () => 'rgba()/rgb() → utiliser un token (--shadow-*, --ring-*, --dot-grid, --rule-accent…)',
  )

  // R9 — cubic-bezier() brut (la courbe de marque est var(--ease-step))
  flag(
    /\bcubic-bezier\(/g,
    'ease-brut',
    () => 'cubic-bezier() → utiliser var(--ease-step)',
  )

  return vs
}

// ── Règles <template> ─────────────────────────────────────────────────────────
function lintTemplate(raw, file) {
  const vs    = []
  const lines = raw.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i]

    // R5 — Vocabulaire interdit
    for (const word of FORBIDDEN) {
      if (ln.toLowerCase().includes(word))
        vs.push({ file, rule: 'vocab-interdit', line: i + 1,
          detail: `"${word}" → vocabulaire interdit par le DS` })
    }

    // R6 — Emoji (Emoji_Presentation = affiché emoji par défaut ;
    //   exclut ©, ·, ® et autres Extended_Pictographic purement textuels)
    if (/\p{Emoji_Presentation}/u.test(ln))
      vs.push({ file, rule: 'emoji', line: i + 1,
        detail: 'Emoji détecté → les emoji sont interdits par le DS' })
  }

  return vs
}

// ── R10 — Nommage des composants ──────────────────────────────────────────────
// PascalCase, deux mots minimum (style guide Vue — évite les collisions avec
// de futurs éléments HTML natifs). L'attribution du préfixe (Pxlc/Site/Blog)
// reste un jugement documenté dans design.md — seule la forme est mécanisable.
const COMPONENT_NAME_RE = /^[A-Z][a-z0-9]*([A-Z][a-z0-9]*)+$/

function lintComponentName(file) {
  const base = file.split(/[\\/]/).pop().replace(/\.(vue|astro)$/, '')
  if (COMPONENT_NAME_RE.test(base)) return []
  return [{ file, rule: 'nommage-composant', line: 1,
    detail: `"${base}" → PascalCase, deux mots minimum (ex. PxlcMark, SiteHeader)` }]
}

// ── R7 — Longueurs SEO ────────────────────────────────────────────────────────
// Limites partagées via scripts/seo-limits.mjs.
// Seules les valeurs LITTÉRALES sont vérifiées — les expressions dynamiques
// (ex. post.value.seoTitle || …) sont couvertes côté contenu par le schéma
// zod de la collection blog.
function lintSeoMeta(src, file) {
  const vs = []
  const limits = { title: SEO_TITLE_MAX, description: SEO_DESC_MAX, ogDescription: SEO_DESC_MAX }

  // Deux formes : l'ancien useSeoMeta({…}) (.vue) et l'objet plat
  // `const seo = {…}` des pages .astro (cible du spread <BaseLayout {...seo}>).
  for (const block of src.matchAll(/(?:useSeoMeta\(\s*|const seo\s*=\s*)\{([\s\S]*?)\}/g)) {
    const body = block[1]
    const bodyOffset = block.index + block[0].indexOf(body)
    for (const m of body.matchAll(/\b(title|description|ogDescription)\s*:\s*(['"])((?:\\.|(?!\2)[\s\S])*?)\2/g)) {
      const [, key, , value] = m
      const max = limits[key]
      if (value.length > max) {
        const hint = key === 'title'
          ? `le titleTemplate ajoute « · PXLC » → base ≤ ${max}`
          : `limite mobile/cartes sociales ≤ ${max}`
        vs.push({ file, rule: 'seo-longueur', line: lineAt(src, bodyOffset + m.index),
          detail: `${key} de ${value.length} caractères — ${hint}` })
      }
    }
  }
  return vs
}

// ── R11 — Espaces insécables manquants ────────────────────────────────────────
// Détecte un espace ASCII (U+0020) là où la typo française impose une insécable :
// avant ? ! : ; », après «, et entre un nombre et une unité-symbole (h, min, €, %).
// Les unités en toutes lettres (ans, mois, jours) sont hors scope (décision marque).
// Scanne UNIQUEMENT la copy, jamais le code, pour éviter les faux positifs
// (ternaires `a ? b : c`, styles takumi, apostrophes ASCII en commentaire) :
//   1. texte rendu de <template> — balises <…> et mustaches {{…}} neutralisées ;
//   2. valeurs d'attributs statiques du template (source=, placeholder=…) —
//      les bindings :x / @x / v-x sont exclus (ce sont du JS) ;
//   3. valeurs de chaîne des clés porteuses de copy (title, description, q, a…)
//      ancrées sur « clé: 'littéral' » — un ternaire (clé: cond ? …) ou un
//      commentaire ne matchent pas (pas de quote immédiate après la clé).
// La ponctuation doit suivre un mot (lettre/chiffre/parenthèse fermante/»)
// et ne pas être un opérateur JS (` !== `, ` ?. `) pour être de la copy —
// écarte la ponctuation JS des templates .astro (négation ` !x`, ternaires
// `? <a` / `: <span`, comparaisons `a !== b`).
const NBSP_RE = /[\p{L}\d)»] ([?!:;»])(?![=.])|(«) |\d (?:h|min)\b|\d ([€%])/gu
const nbspWhat = m => m[1] ? `espace avant « ${m[1]} »`
  : m[2] !== undefined ? 'espace après «'
  : m[3] ? `espace avant « ${m[3]} »`
  : 'espace entre nombre et unité'

function lintNbsp(src, file) {
  const vs = []
  const blank = s => ' '.repeat(s.length)
  const hits = (text, base) => {
    for (const m of text.matchAll(NBSP_RE)) {
      vs.push({ file, rule: 'nbsp-manquante', line: lineAt(src, base + m.index),
        detail: `${nbspWhat(m)} → insécable manquante (\\u00A0 en JS, &nbsp; en template)` })
    }
  }

  // .vue : bloc <template> ; .astro : balisage après le frontmatter
  // (parseAstro l'a déjà neutralisé, on le re-dérive ici pour garder des
  // index absolus dans src).
  const isAstro = file.endsWith('.astro')
  let body = ''
  let base = 0
  if (isAstro) {
    const fm = src.match(/^---\r?\n[\s\S]*?\r?\n---/)
    base = fm ? fm[0].length : 0
    body = src.slice(base)
      .replace(/<style[^>]*>[\s\S]*?<\/style>/g, blank)
      .replace(/<script[^>]*>[\s\S]*?<\/script>/g, blank)
  }
  else {
    const t = src.match(/<template[^>]*>([\s\S]*?)<\/template>/)
    if (t) {
      body = t[1]
      base = t.index + t[0].indexOf(body)
    }
  }
  if (body) {
    // 1) Texte rendu : on blanchit commentaires <!-- -->, balises, mustaches
    //    Vue {{…}} et expressions Astro {…} (longueur préservée → lineAt exact).
    hits(body
      .replace(/<!--[\s\S]*?-->/g, blank)
      .replace(/<[^>]*>/g, blank)
      .replace(/\{\{[\s\S]*?\}\}/g, blank)
      .replace(/\{[^{}]*\}/g, blank), base)
    // 2) Attributs statiques (nom sans préfixe : @ v-). m[2] = valeur.
    for (const m of body.matchAll(/(?<![\w:@-])([a-zA-Z][\w-]*)="([^"]*)"/g)) {
      if (m[1].startsWith('v-')) continue
      hits(m[2], base + m.index + m[0].length - m[2].length - 1)
    }
  }

  // 3) Valeurs de chaîne des clés de copy (script & objets template).
  const KEYS = 'title|description|ogDescription|eyebrow|lead|quote|attribution|source|name|detail|placeholder|q|a'
  const keyRe = new RegExp(`\\b(?:${KEYS})\\s*:\\s*(['"\`])((?:\\\\.|(?!\\1)[\\s\\S])*?)\\1`, 'g')
  for (const m of src.matchAll(keyRe))
    hits(m[2], m.index + m[0].length - m[2].length - 1)

  return vs
}

// ── R12 — Phrases interdites (garde-fous factuels) ─────────────────────────────
// Faits PXLC qui ont une seule formulation correcte et tendent à dériver. À la
// différence de R5 (vocab-interdit, scopé aux <template> .vue), ces phrases
// peuvent réapparaître dans n'importe quelle source de copy — d'où un balayage
// élargi à tout .astro/.ts sous src/ (plaquette comprise, où le pluriel avait
// justement dérapé).
// L'espace entre les deux mots peut être ASCII, insécable (\s couvre U+00A0) ou
// l'entité HTML &nbsp; — d'où (?:&nbsp;|\s)+.
const FORBIDDEN_PHRASES = [
  {
    re: /intervenants(?:&nbsp;|\s)+culturels/gi,
    msg: '« intervenants culturels » → un seul intervenant culturel (Lékoklaya) : toujours au singulier',
  },
  // Graphies officielles des instances de santé — sensibles à la casse (pas de
  // flag i) : c'est la majuscule fautive qu'on chasse, la forme correcte passe.
  {
    re: /Santé(?:&nbsp;|\s)+Publique/g,
    msg: '« Santé Publique » → graphie officielle « Haut Conseil de la santé publique » (minuscules)',
  },
  {
    re: /Haute(?:&nbsp;|\s)+Autorité(?:&nbsp;|\s)+de(?:&nbsp;|\s)+Santé/g,
    msg: '« Haute Autorité de Santé » → graphie officielle « Haute Autorité de santé » (minuscule)',
  },
]

async function lintForbiddenPhrases() {
  const vs = []
  const sources = await walk(join(ROOT, 'src'), ['.ts', '.astro'])
  for (const file of sources) {
    let src
    try { src = await readFile(file, 'utf8') }
    catch (err) { if (err.code !== 'ENOENT') throw err; continue }
    for (const { re, msg } of FORBIDDEN_PHRASES)
      for (const m of src.matchAll(re))
        vs.push({ file, rule: 'phrase-interdite', line: lineAt(src, m.index), detail: msg })
  }
  return vs
}

/** Vérifie SITE.description de src/config/site.ts (meta description par défaut). */
async function lintSiteConfig() {
  const file = join(ROOT, 'src/config/site.ts')
  let src
  try { src = await readFile(file, 'utf8') }
  catch (err) {
    if (err.code !== 'ENOENT') throw err
    return []
  }
  const m = src.match(/description:\s*\r?\n?\s*(['"])((?:\\.|(?!\1)[\s\S])*?)\1/)
  if (m && m[2].length > SEO_DESC_MAX) {
    return [{ file, rule: 'seo-longueur', line: lineAt(src, m.index),
      detail: `SITE.description de ${m[2].length} caractères — limite mobile/cartes sociales ≤ ${SEO_DESC_MAX}` }]
  }
  return []
}

// ── Main ──────────────────────────────────────────────────────────────────────
const main = async () => {
  const allFiles = (
    await Promise.all(SCAN_DIRS.map(d => walk(join(ROOT, d), SCAN_EXTS)))
  ).flat()

  const all = []
  const componentsRoot = join(ROOT, 'src/components')
  await Promise.all(allFiles.map(async file => {
    const src = await readFile(file, 'utf8')
    const { template, style } = file.endsWith('.astro') ? parseAstro(src) : parseSfc(src)
    all.push(...lintStyle(style, file), ...lintTemplate(template, file), ...lintSeoMeta(src, file), ...lintNbsp(src, file))
    if (file.startsWith(componentsRoot)) all.push(...lintComponentName(file))
  }))
  // Feuilles CSS globales : le fichier entier passe par les règles couleur.
  await Promise.all(CSS_FILES.map(async rel => {
    const file = join(ROOT, rel)
    all.push(...lintStyle(await readFile(file, 'utf8'), file, CSS_RULES))
  }))
  all.push(...await lintSiteConfig())
  all.push(...await lintForbiddenPhrases())

  if (!all.length) {
    console.log('ds-lint: ✓ aucune violation DS')
    return
  }

  // Regroupe par fichier
  const byFile = {}
  for (const v of all) (byFile[v.file] ??= []).push(v)

  console.error('\nds-lint — violations DS\n')
  for (const [file, vs] of Object.entries(byFile)) {
    console.error(`  ${relative(ROOT, file)}`)
    for (const { rule, line, detail } of vs.sort((a, b) => a.line - b.line))
      console.error(`    L${String(line).padEnd(4)}  [${rule}]  ${detail}`)
  }
  console.error(`\n  ${all.length} violation(s) — corrige avant de builder.\n`)
  process.exit(1)
}

main().catch(err => { console.error(err); process.exit(2) })
