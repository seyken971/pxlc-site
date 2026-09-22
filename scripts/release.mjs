#!/usr/bin/env node
/**
 * scripts/release.mjs
 * Sortie d'une PR en une commande : attend la CI, fusionne en squash, attend
 * le déploiement GitHub Pages du commit de fusion, puis vérifie la prod.
 *
 *   npm run release -- 254      (numéro de PR)
 *   npm run release             (PR de la branche courante)
 *
 * Étapes :
 *   1. gh pr checks --watch     — la CI de la PR doit être verte ;
 *   2. gh pr merge --squash --delete-branch ;
 *   3. git fetch origin main — le commit de fusion est lu sur origin/main,
 *      puis bascule sur main (ff-only) si elle n'est pas occupée par un autre
 *      worktree — sinon la branche courante est conservée ;
 *   4. run « Deploy to GitHub Pages » du commit de fusion (poll 10 s, 3 min max
 *      — un run peut mettre du temps à être planifié), puis gh run watch ;
 *   5. prod : chaque <loc> du sitemap répond 200 avec un canonical égal à
 *      l'URL, et la liste des URLs est celle du build local (dist) s'il existe ;
 *   6. IndexNow : soumet les pages dont le lastmod porte le commit de fusion
 *      (scripts/indexnow.mjs) — jamais bloquant, `npm run indexnow -- --all`
 *      pour tout resoumettre.
 *
 * Rien de destructif : pas de force, pas de suppression locale. Exit 1 au
 * premier écart, avec la raison.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { setTimeout as sleep } from 'node:timers/promises'
import { submitIndexNow } from './indexnow.mjs'

const SITE = 'https://pxlc.fr'
const WORKFLOW = 'Deploy to GitHub Pages'

const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], ...opts }).trim()
const runLive = (cmd, args) => execFileSync(cmd, args, { stdio: 'inherit' })
const json = (cmd, args) => JSON.parse(run(cmd, args))
const fail = (msg) => { console.error(`\nrelease: ✗ ${msg}`); process.exit(1) }
const step = (msg) => console.log(`\n→ ${msg}`)

const parseLocs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]).sort()

const main = async () => {
  // Numéro de PR : argument, sinon la PR de la branche courante.
  let pr = process.argv[2]
  if (!pr) {
    try { pr = String(json('gh', ['pr', 'view', '--json', 'number']).number) }
    catch { fail('aucune PR pour la branche courante — passer le numéro : npm run release -- <n>') }
  }
  const { title, state, headRefName } = json('gh', ['pr', 'view', pr, '--json', 'title,state,headRefName'])
  if (state !== 'OPEN') fail(`PR #${pr} n'est pas ouverte (${state})`)
  console.log(`PR #${pr} — ${title} (${headRefName})`)

  step('CI de la PR')
  try { runLive('gh', ['pr', 'checks', pr, '--watch', '--fail-fast', '--interval', '10']) }
  catch { fail('la CI de la PR a échoué — rien n\'a été fusionné') }

  step('Fusion en squash')
  try { runLive('gh', ['pr', 'merge', pr, '--squash', '--delete-branch']) }
  catch {
    // L'étape locale de gh échoue quand main est occupé par un autre worktree
    // alors que la fusion distante a abouti : on tranche sur l'état réel.
    if (json('gh', ['pr', 'view', pr, '--json', 'state']).state !== 'MERGED') fail('fusion refusée')
    console.log('  fusion distante confirmée malgré l\'erreur locale de gh')
  }

  step('Commit de fusion')
  // Checkout de main tenté, abandonné si un autre worktree l'occupe : la
  // fusion distante a abouti, seul l'état local diffère.
  runLive('git', ['fetch', 'origin', 'main'])
  const sha = run('git', ['rev-parse', 'origin/main'])
  console.log(`  ${sha.slice(0, 7)} ${run('git', ['log', '-1', '--format=%s', sha])}`)
  try {
    run('git', ['checkout', '-q', 'main'], { stdio: ['ignore', 'pipe', 'pipe'] })
    runLive('git', ['merge', '--ff-only', '-q', sha])
  } catch {
    console.log('  main occupée par un autre worktree : branche courante conservée')
  }

  step(`Run « ${WORKFLOW} » du commit de fusion`)
  let runId = null
  for (let i = 0; i < 18 && !runId; i++) {
    const runs = json('gh', ['run', 'list', '--branch', 'main', '--workflow', WORKFLOW, '--limit', '5', '--json', 'databaseId,headSha'])
    runId = runs.find(r => r.headSha === sha)?.databaseId ?? null
    if (!runId) await sleep(10_000)
  }
  if (!runId) fail(`aucun run planifié en 3 min — relancer par workflow_dispatch : gh workflow run "${WORKFLOW}"`)
  try { runLive('gh', ['run', 'watch', String(runId), '--exit-status', '--interval', '10']) }
  catch { fail(`run ${runId} en échec — gh run view ${runId}`) }

  step('Vérification de la prod')
  const sitemapRes = await fetch(`${SITE}/sitemap-0.xml`, { cache: 'no-store' })
  if (!sitemapRes.ok) fail(`sitemap-0.xml : HTTP ${sitemapRes.status}`)
  const locs = parseLocs(await sitemapRes.text())

  if (existsSync('dist/sitemap-0.xml')) {
    const local = parseLocs(readFileSync('dist/sitemap-0.xml', 'utf8'))
    if (local.join('\n') !== locs.join('\n')) {
      console.error(`  local : ${local.join(', ')}\n  prod  : ${locs.join(', ')}`)
      fail('le sitemap servi ne correspond pas au build local (dist) — build à refaire ?')
    }
  }

  const rows = []
  let ok = true
  for (const loc of locs) {
    const res = await fetch(loc, { cache: 'no-store', redirect: 'manual' })
    const html = res.ok ? await res.text() : ''
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? null
    const good = res.status === 200 && canonical === loc
    ok &&= good
    rows.push(`  ${good ? '✓' : '✗'} ${loc.replace(SITE, '') || '/'}  HTTP ${res.status}${canonical === loc ? '' : `  canonical=${canonical}`}`)
  }
  console.log(rows.join('\n'))
  if (!ok) fail('au moins une page de prod ne répond pas comme attendu')

  step('IndexNow')
  await submitIndexNow({ since: run('git', ['log', '-1', '--format=%cI', sha]) })

  console.log(`\nrelease: ✓ PR #${pr} fusionnée, déployée et vérifiée (${locs.length} URLs)`)
}

main().catch((err) => { console.error(err); process.exit(2) })
