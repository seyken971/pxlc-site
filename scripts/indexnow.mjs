#!/usr/bin/env node
/**
 * scripts/indexnow.mjs
 * Notifie IndexNow (Bing, Yandex, Naver, Seznam — Google n'y participe pas)
 * des pages modifiées, après un déploiement vérifié. Appelé par release.mjs
 * en dernière étape ; utilisable seul :
 *
 *   npm run indexnow                    # pages dont le lastmod ≥ HEAD
 *   npm run indexnow -- --all           # toutes les URLs du sitemap (refonte globale)
 *   npm run indexnow -- --since <iso>   # pages dont le lastmod ≥ cette date
 *   npm run indexnow -- --dry-run       # affiche le payload sans l'envoyer
 *
 * Sélection : le sitemap servi en prod fait foi ; sont soumises les <url> dont
 * le <lastmod> est postérieur ou égal à `since`. Comme le lastmod dérive du
 * dernier commit touchant `src/pages/<page>.astro` (sitemap-lastmod.mjs), les
 * pages touchées par un commit de fusion portent exactement sa date. Limite
 * assumée, la même que le sitemap : une page dont seul un composant a changé
 * n'est pas soumise — d'où --all.
 *
 * La clé est publique par construction (servie en clair à /<clé>.txt), ce
 * n'est pas un secret. Un échec de soumission s'affiche mais ne fait jamais
 * échouer l'appelant : le déploiement a réussi, la notification est un bonus.
 * Le fichier clé est exigé au build par check-links (REQUIRED).
 */
import { execFileSync } from 'node:child_process'

const SITE = 'https://pxlc.fr'
const HOST = 'pxlc.fr'
export const INDEXNOW_KEY = '95297c18fa0da7e41418297e1cede680'
const KEY_URL = `${SITE}/${INDEXNOW_KEY}.txt`
const ENDPOINT = 'https://api.indexnow.org/indexnow'

/** Entrées { loc, lastmod } d'un sitemap XML, triées par loc. */
export const parseEntries = (xml) => [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)]
  .map(([, block]) => ({
    loc: block.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? null,
    lastmod: block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? null,
  }))
  .filter(e => e.loc)
  .sort((a, b) => a.loc.localeCompare(b.loc))

/**
 * Soumet à IndexNow les URLs du sitemap de prod modifiées depuis `since`
 * (ISO 8601), ou toutes si `all`. Retourne { submitted, status } sans jamais
 * lever pour une raison réseau ou serveur.
 */
export const submitIndexNow = async ({ since, all = false, dryRun = false } = {}) => {
  const log = (msg) => console.log(`  ${msg}`)

  const keyRes = await fetch(KEY_URL, { cache: 'no-store' }).catch(() => null)
  const served = keyRes?.ok ? (await keyRes.text()).trim() : null
  if (served !== INDEXNOW_KEY) {
    log(`clé IndexNow non servie (${KEY_URL} : ${keyRes ? `HTTP ${keyRes.status}` : 'injoignable'}) — soumission ignorée`)
    return { submitted: [], status: null }
  }

  const sitemapRes = await fetch(`${SITE}/sitemap-0.xml`, { cache: 'no-store' }).catch(() => null)
  if (!sitemapRes?.ok) {
    log(`sitemap-0.xml : ${sitemapRes ? `HTTP ${sitemapRes.status}` : 'injoignable'} — soumission ignorée`)
    return { submitted: [], status: null }
  }
  const entries = parseEntries(await sitemapRes.text())

  let selected = entries
  if (!all) {
    const cutoff = Date.parse(since ?? '')
    if (Number.isNaN(cutoff)) throw new Error(`indexnow : date --since invalide (${since})`)
    selected = entries.filter(e => e.lastmod && Date.parse(e.lastmod) >= cutoff)
  }
  const urlList = selected.map(e => e.loc)

  if (!urlList.length) {
    log(`aucune page modifiée depuis ${since} — rien soumis (${entries.length} URLs au sitemap)`)
    return { submitted: [], status: null }
  }

  const payload = { host: HOST, key: INDEXNOW_KEY, keyLocation: KEY_URL, urlList }
  for (const u of urlList) log(`· ${u.replace(SITE, '') || '/'}`)
  if (dryRun) {
    log(`dry-run : POST ${ENDPOINT}\n${JSON.stringify(payload, null, 2)}`)
    return { submitted: urlList, status: null }
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  }).catch((err) => ({ ok: false, status: null, error: err }))

  if (res.status === 200 || res.status === 202) log(`✓ IndexNow : ${urlList.length} URL(s) soumise(s) (HTTP ${res.status})`)
  else log(`✗ IndexNow : HTTP ${res.status ?? 'injoignable'}${res.error ? ` — ${res.error.message}` : ''} — à relancer : npm run indexnow -- --all`)
  return { submitted: urlList, status: res.status }
}

const isCli = process.argv[1] && import.meta.url === new URL(`file:///${process.argv[1].replace(/\\/g, '/')}`).href
if (isCli) {
  const args = process.argv.slice(2)
  const flag = (name) => args.includes(name)
  const value = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined }
  const since = value('--since') ?? execFileSync('git', ['log', '-1', '--format=%cI'], { encoding: 'utf8' }).trim()
  submitIndexNow({ since, all: flag('--all'), dryRun: flag('--dry-run') })
    .catch((err) => { console.error(err.message); process.exit(2) })
}
