#!/usr/bin/env node
/**
 * scripts/seo-check.mjs
 * Compare la surface SEO du build (dist) à la baseline versionnée
 * (docs/seo-baseline) — le build échoue sur tout écart.
 *
 *   node scripts/seo-check.mjs [buildDir] [baselineDir]
 *   npm run seo:check
 *
 * Écart volontaire (titre, description, JSON-LD, sitemap, robots) :
 *   npm run seo:accept   → recapture la baseline
 * puis committer docs/seo-baseline avec le changement qui l'a motivé.
 *
 * La capture (scripts/seo-snapshot.mjs) ignore ce qui n'est pas du SEO —
 * meta CSP, dateModified, lastmod — pour que la baseline ne bouge que quand
 * le SEO bouge.
 */
import { readFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { snapshot } from './seo-snapshot.mjs'

const BUILD_DIR = process.argv[2] || 'dist'
const BASELINE_DIR = process.argv[3] || 'docs/seo-baseline'
// Capture de travail, gitignorée — reste inspectable après un échec.
const CURRENT_DIR = 'docs/seo-current'

const show = (value) => {
  const s = value === undefined ? '(absent)' : JSON.stringify(value)
  return s.length > 140 ? `${s.slice(0, 137)}…` : s
}

/** Diff profond : liste de { path, before, after }, chemins lisibles. */
const diff = (before, after, path = '', out = []) => {
  if (Array.isArray(before) && Array.isArray(after)) {
    const n = Math.max(before.length, after.length)
    for (let i = 0; i < n; i++) diff(before[i], after[i], `${path}[${i}]`, out)
    return out
  }
  const isObj = v => v && typeof v === 'object' && !Array.isArray(v)
  if (isObj(before) && isObj(after)) {
    for (const key of new Set([...Object.keys(before), ...Object.keys(after)]).values()) {
      diff(before[key], after[key], path ? `${path}.${key}` : key, out)
    }
    return out
  }
  if (JSON.stringify(before) !== JSON.stringify(after)) out.push({ path: path || '(racine)', before, after })
  return out
}

const main = async () => {
  if (!existsSync(BUILD_DIR)) {
    console.error(`seo-check: build introuvable (${BUILD_DIR}) — lancer le build d'abord.`)
    process.exit(2)
  }
  if (!existsSync(BASELINE_DIR)) {
    console.error(`seo-check: baseline introuvable (${BASELINE_DIR}) — npm run seo:accept pour la créer.`)
    process.exit(2)
  }

  await snapshot(BUILD_DIR, CURRENT_DIR, { quiet: true })

  const files = new Set([...await readdir(BASELINE_DIR), ...await readdir(CURRENT_DIR)])
  const report = []

  for (const name of [...files].sort()) {
    const basePath = join(BASELINE_DIR, name)
    const curPath = join(CURRENT_DIR, name)
    if (!existsSync(curPath)) { report.push([name, [{ path: '(fichier)', before: 'présent dans la baseline', after: undefined }]]); continue }
    if (!existsSync(basePath)) { report.push([name, [{ path: '(fichier)', before: undefined, after: 'nouveau dans le build' }]]); continue }

    const [a, b] = await Promise.all([readFile(basePath, 'utf8'), readFile(curPath, 'utf8')])
    if (name.endsWith('.json')) {
      const entries = diff(JSON.parse(a), JSON.parse(b))
      if (entries.length) report.push([name, entries])
    }
    else if (a.replace(/\r\n/g, '\n') !== b.replace(/\r\n/g, '\n')) {
      report.push([name, [{ path: '(texte)', before: `${a.length} caractères`, after: `${b.length} caractères` }]])
    }
  }

  if (!report.length) {
    console.log(`seo-check: ✓ surface SEO identique à la baseline (${files.size} fichiers)`)
    return
  }

  console.error('\nseo-check — écarts avec docs/seo-baseline\n')
  for (const [name, entries] of report) {
    console.error(`  ${name}`)
    for (const { path, before, after } of entries) {
      console.error(`    ${path}`)
      console.error(`      - ${show(before)}`)
      console.error(`      + ${show(after)}`)
    }
  }
  console.error(`\n  ${report.length} fichier(s) — si l'écart est voulu : npm run seo:accept, puis committer docs/seo-baseline avec le changement.\n`)
  process.exit(1)
}

main().catch((err) => { console.error(err); process.exit(2) })
