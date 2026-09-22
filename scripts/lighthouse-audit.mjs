#!/usr/bin/env node
/**
 * Lighthouse runtime audit — drives a real Chrome via chrome-launcher,
 * runs Lighthouse on each prerendered route, and prints a compact table
 * of category scores + Core Web Vitals.
 *
 * Run after `npm run build`:
 *   node scripts/lighthouse-audit.mjs
 *   node scripts/lighthouse-audit.mjs --json   # raw JSON aggregate
 */
import { appendFile } from 'node:fs/promises'
import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'
import { startServer, discoverRoutes } from './static-server.mjs'

const JSON_MODE = process.argv.includes('--json')

const FLAGS = {
  output: 'json',
  onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  // Mobile emulation — Google ranks Core Web Vitals on the mobile field
  // signal, so that's the harder bar to clear.
  formFactor: 'mobile',
  screenEmulation: {
    mobile: true,
    width: 360,
    height: 640,
    deviceScaleFactor: 2,
    disabled: false,
  },
}

const fmtScore = (score) => {
  if (score == null) return ' n/a '
  const pct = Math.round(score * 100)
  const color = pct >= 90 ? '\x1b[32m' : pct >= 50 ? '\x1b[33m' : '\x1b[31m'
  return `${color}${String(pct).padStart(3)}%\x1b[0m`
}

const fmtMs = (n) => n == null ? '—' : `${Math.round(n)}ms`
const fmtCls = (n) => n == null ? '—' : n.toFixed(3)

const auditRoute = async (port, route, port_chrome) => {
  const url = `http://127.0.0.1:${port}${route}`
  const { lhr } = await lighthouse(url, { ...FLAGS, port: port_chrome })
  const c = lhr.categories
  const a = lhr.audits
  return {
    route,
    perf: c.performance?.score,
    a11y: c.accessibility?.score,
    bp: c['best-practices']?.score,
    seo: c.seo?.score,
    lcp: a['largest-contentful-paint']?.numericValue,
    cls: a['cumulative-layout-shift']?.numericValue,
    tbt: a['total-blocking-time']?.numericValue,
    fcp: a['first-contentful-paint']?.numericValue,
    si:  a['speed-index']?.numericValue,
    opportunities: Object.values(a)
      .filter(x => x.details?.type === 'opportunity' && x.numericValue > 100)
      .map(x => ({ id: x.id, title: x.title, savings: Math.round(x.numericValue) }))
      .sort((p, q) => q.savings - p.savings)
      .slice(0, 5),
  }
}

const main = async () => {
  const { server, port } = await startServer()
  const routes = await discoverRoutes()
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--no-sandbox'] })
  const all = []

  try {
    for (const route of routes) {
      process.stderr.write(`auditing ${route} ... `)
      try {
        const r = await auditRoute(port, route, chrome.port)
        all.push(r)
        process.stderr.write('ok\n')
      } catch (err) {
        process.stderr.write(`fail (${err.message})\n`)
      }
    }
  } finally {
    // Windows race: chrome-launcher sometimes fails to delete its tmp
    // user-data-dir because Chrome's lingering process still has a
    // handle. Swallow that — Chrome is dead, OS cleans up the dir later.
    try { await chrome.kill() } catch { /* ignored */ }
    server.close()
  }

  if (JSON_MODE) {
    console.log(JSON.stringify(all, null, 2))
    return
  }

  console.log('')
  console.log('Route'.padEnd(46) + 'Perf  A11y  BP    SEO   LCP      CLS    TBT')
  console.log('─'.repeat(94))
  for (const r of all) {
    console.log(
      r.route.padEnd(46) +
      `${fmtScore(r.perf)}  ${fmtScore(r.a11y)}  ${fmtScore(r.bp)}  ${fmtScore(r.seo)}  ` +
      `${fmtMs(r.lcp).padStart(7)}  ${fmtCls(r.cls).padStart(5)}  ${fmtMs(r.tbt).padStart(5)}`,
    )
  }

  console.log('')
  console.log('Top opportunities by route (savings >100 ms):')
  for (const r of all) {
    if (!r.opportunities.length) continue
    console.log(`  ${r.route}`)
    for (const o of r.opportunities) {
      console.log(`    -${String(o.savings).padStart(5)}ms  ${o.id} — ${o.title.slice(0, 80)}`)
    }
  }

  // GitHub Actions step summary — when GITHUB_STEP_SUMMARY is set the
  // runner renders the file content as Markdown on the workflow page.
  // We append a digest table so the cron run is glanceable without
  // clicking into the raw log.
  if (process.env.GITHUB_STEP_SUMMARY) {
    const pct = (s) => s == null ? 'n/a' : `${Math.round(s * 100)}%`
    const ms = (n) => n == null ? '—' : `${Math.round(n)} ms`
    const cls = (n) => n == null ? '—' : n.toFixed(3)
    const md = [
      '## Lighthouse audit',
      '',
      `Ran on ${new Date().toISOString()} — mobile profile (4× CPU + slow 4G), localhost static server.`,
      '',
      '| Route | Perf | A11y | BP | SEO | LCP | CLS | TBT |',
      '|---|---|---|---|---|---|---|---|',
      ...all.map(r =>
        `| \`${r.route}\` | ${pct(r.perf)} | ${pct(r.a11y)} | ${pct(r.bp)} | ${pct(r.seo)} | ${ms(r.lcp)} | ${cls(r.cls)} | ${ms(r.tbt)} |`,
      ),
      '',
      '> Scores ≥ 90% green, 50–89% yellow, < 50% red. The numbers above are mobile-throttled localhost, not production. Compare against PageSpeed Insights on `https://pxlc.fr` for the real baseline.',
      '',
    ]

    const tops = all.filter(r => r.opportunities.length)
    if (tops.length) {
      md.push('### Top opportunities (savings > 100 ms)', '')
      for (const r of tops) {
        md.push(`**\`${r.route}\`**`)
        for (const o of r.opportunities) {
          md.push(`- \`${o.id}\` — ${o.title} (–${o.savings} ms)`)
        }
        md.push('')
      }
    }

    await appendFile(process.env.GITHUB_STEP_SUMMARY, md.join('\n'))
      .catch(err => process.stderr.write(`warning: failed to write step summary: ${err.message}\n`))
  }

  // Toujours exit 0 : workflow informatif (continue-on-error). Les régressions
  // a11y sont gardées par les audits axe du déploiement.
  process.exit(0)
}

main().catch(err => { console.error(err); process.exit(2) })
