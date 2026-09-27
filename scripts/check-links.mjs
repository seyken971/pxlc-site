#!/usr/bin/env node
/**
 * Vérifie les liens internes du build statique — le build échoue sur lien
 * mort. Pour chaque page de dist :
 *
 *  - tout href interne doit résoudre vers un fichier émis (page/, asset) ;
 *  - toute page interne doit porter le slash final (parité canonical
 *    GitHub Pages — la forme sans slash 301-redirige) ;
 *  - les ancres #fragment vers une page interne doivent exister dans la cible ;
 *  - tout lien vers un asset (PDF…) porte data-astro-prefetch="false" : le
 *    prefetch viewport d'Astro ne filtre pas les extensions et chargerait le
 *    fichier entier dès que le lien devient visible.
 *
 * La 404 racine est vérifiée comme les autres pages.
 *
 *   node scripts/check-links.mjs [buildDir]
 */
import { readFile, readdir, stat } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import { JSDOM } from 'jsdom'

const BUILD_DIR = process.argv[2] || 'dist'

const findHtml = async (dir) => {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...await findHtml(p))
    else if (entry.isFile() && (entry.name === 'index.html' || (dir === BUILD_DIR && entry.name === '404.html'))) out.push(p)
  }
  return out
}

const exists = async (path) => {
  try { await stat(path); return true }
  catch { return false }
}

// Fichiers que GitHub Pages exige : .nojekyll et CNAME viennent de public/ et
// disparaîtraient en silence — sans eux, le domaine et les chemins en
// _underscore cassent. Vérifié ici plutôt qu'en étape CI à part.
// La clé IndexNow (scripts/indexnow.mjs) doit être servie à la racine : sans
// elle, toute soumission est rejetée et la clé devient invalide côté moteurs.
const REQUIRED = ['index.html', 'sitemap-index.xml', 'robots.txt', '.nojekyll', 'CNAME', '95297c18fa0da7e41418297e1cede680.txt']

const main = async () => {
  const missing = []
  for (const f of REQUIRED) if (!await exists(join(BUILD_DIR, f))) missing.push(f)
  if (missing.length) {
    console.error(`check-links: ✗ fichier(s) requis manquant(s) dans ${BUILD_DIR} : ${missing.join(', ')}`)
    process.exit(1)
  }

  const pages = await findHtml(BUILD_DIR)
  const idsByRoute = new Map()
  const linksByPage = []

  for (const path of pages) {
    const rel = relative(BUILD_DIR, path).split(sep).join('/')
    const route = '/' + rel.replace(/index\.html$/, '')
    const dom = new JSDOM(await readFile(path, 'utf8'))
    const doc = dom.window.document
    idsByRoute.set(route, new Set([...doc.querySelectorAll('[id]')].map(el => el.id)))
    linksByPage.push({
      route,
      links: [...doc.querySelectorAll('a[href]')].map(a => ({
        href: a.getAttribute('href'),
        prefetch: a.getAttribute('data-astro-prefetch'),
      })),
    })
    dom.window.close()
  }

  const errors = []
  for (const { route, links } of linksByPage) {
    for (const { href, prefetch } of links) {
      // Externes, mailto/tel et ancres locales : hors périmètre.
      if (/^(https?:|mailto:|tel:|#)/.test(href)) continue

      const [pathname, fragment] = href.split('#')

      if (/\.[a-z0-9]+$/i.test(pathname)) {
        // Asset (PDF, image…) — le fichier doit exister.
        if (!await exists(join(BUILD_DIR, ...pathname.split('/').filter(Boolean)))) {
          errors.push(`${route} → ${href} : fichier introuvable`)
        }
        if (prefetch !== 'false') {
          errors.push(`${route} → ${href} : data-astro-prefetch="false" manquant (le prefetch chargerait le fichier)`)
        }
        continue
      }

      if (!pathname.endsWith('/')) {
        errors.push(`${route} → ${href} : slash final manquant (parité canonical GitHub Pages)`)
        continue
      }
      if (!idsByRoute.has(pathname)) {
        errors.push(`${route} → ${href} : page interne inexistante`)
        continue
      }
      if (fragment && !idsByRoute.get(pathname).has(fragment)) {
        errors.push(`${route} → ${href} : ancre #${fragment} absente de la cible`)
      }
    }
  }

  if (errors.length) {
    console.error('\ncheck-links — liens internes cassés\n')
    for (const e of errors) console.error(`  ✗ ${e}`)
    console.error(`\n  ${errors.length} lien(s) — corrige avant de déployer.\n`)
    process.exit(1)
  }
  console.log(`check-links: ✓ liens internes valides sur ${pages.length} pages`)
}

main().catch((err) => { console.error(err); process.exit(2) })
