#!/usr/bin/env node
/**
 * Static a11y audit — runs axe-core (jsdom) on every prerendered HTML
 * page under dist/. color-contrast, target-size and meta-viewport are
 * skipped because jsdom doesn't lay out CSS; everything else (ARIA,
 * landmarks, headings, names/roles, semantics) is in scope.
 *
 * Run after `npm run build`:
 *   node scripts/a11y-audit.mjs
 *   node scripts/a11y-audit.mjs --json   # raw JSON for diffing in CI
 */
import { readFile, readdir } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import { JSDOM } from 'jsdom'
import axe from 'axe-core'

const PUBLIC_DIR = 'dist'
const JSON_MODE = process.argv.includes('--json')

// Skip the rules jsdom can't evaluate fairly — they're noise, not findings.
const DISABLED_RULES = ['color-contrast', 'target-size', 'meta-viewport']

// Les pages de redirection émises par `redirects` (meta refresh, noindex) ne
// sont pas des pages : ni <html lang>, ni landmark, juste un lien de repli
// qu'aucun humain ne voit. Les auditer ne mesure rien — on les compte à part
// plutôt que de les taire.
const isRedirectStub = html => /http-equiv="refresh"/i.test(html)

const findHtml = async (dir) => {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...await findHtml(p))
    else if (entry.isFile() && entry.name === 'index.html') out.push(p)
  }
  return out
}

const auditFile = async (path) => {
  const html = await readFile(path, 'utf8')
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true })
  const { window } = dom

  // axe-core needs window globals. Patch the bare minimum.
  global.window = window
  global.document = window.document
  global.Node = window.Node
  global.Element = window.Element
  global.HTMLElement = window.HTMLElement
  global.getComputedStyle = window.getComputedStyle.bind(window)

  // Eval axe-core in the jsdom window so `window.axe` becomes available.
  window.eval(axe.source)

  const results = await window.axe.run(window.document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] },
    rules: Object.fromEntries(DISABLED_RULES.map(r => [r, { enabled: false }])),
    resultTypes: ['violations'],
  })

  dom.window.close()
  return results.violations
}

const main = async () => {
  const pages = await findHtml(PUBLIC_DIR)
  const all = []
  const redirects = []
  for (const path of pages) {
    // relative() + split(sep) → libellé correct sous Windows (path.join produit
    // des antislash) comme sous Linux.
    const rel = relative(PUBLIC_DIR, path).split(sep).join('/')
    const route = ('/' + rel.replace(/index\.html$/, '')).replace(/\/$/, '') || '/'
    if (isRedirectStub(await readFile(path, 'utf8'))) {
      redirects.push(route)
      continue
    }
    const violations = await auditFile(path)
    all.push({ route, file: path, violations })
  }

  if (JSON_MODE) {
    console.log(JSON.stringify(all, null, 2))
    return
  }

  // Human-readable report
  const byImpact = { critical: 0, serious: 0, moderate: 0, minor: 0 }
  let totalViolations = 0

  for (const { route, violations } of all) {
    if (!violations.length) {
      console.log(`\x1b[32m✓\x1b[0m ${route}`)
      continue
    }
    console.log(`\x1b[31m✗\x1b[0m ${route} — ${violations.length} violations`)
    for (const v of violations) {
      byImpact[v.impact] = (byImpact[v.impact] || 0) + v.nodes.length
      totalViolations += v.nodes.length
      const impact = v.impact || 'unknown'
      const color = impact === 'critical' ? '\x1b[31m' : impact === 'serious' ? '\x1b[33m' : '\x1b[36m'
      console.log(`  ${color}[${impact}]\x1b[0m ${v.id} — ${v.help}`)
      console.log(`    ${v.helpUrl}`)
      for (const node of v.nodes.slice(0, 3)) {
        console.log(`    · ${node.target.join(' ')}`)
        console.log(`      ${node.html.length > 140 ? node.html.slice(0, 137) + '...' : node.html}`)
      }
      if (v.nodes.length > 3) console.log(`    · ... and ${v.nodes.length - 3} more`)
    }
  }

  console.log('')
  console.log('─'.repeat(60))
  console.log(`Total: ${totalViolations} violation nodes across ${all.length} pages`)
  console.log(`  Critical: ${byImpact.critical || 0}`)
  console.log(`  Serious:  ${byImpact.serious || 0}`)
  console.log(`  Moderate: ${byImpact.moderate || 0}`)
  console.log(`  Minor:    ${byImpact.minor || 0}`)
  console.log('')
  console.log(`Skipped rules (jsdom can't evaluate): ${DISABLED_RULES.join(', ')}`)
  if (redirects.length) console.log(`Pages de redirection ignorées : ${redirects.join(', ')}`)

  if ((byImpact.critical || 0) + (byImpact.serious || 0) > 0) process.exit(1)
}

main().catch(err => { console.error(err); process.exit(2) })
