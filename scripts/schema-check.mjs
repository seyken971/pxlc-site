#!/usr/bin/env node
/**
 * Vérifie le graphe schema.org du build statique — le build échoue sur graphe
 * incohérent. Complète seo-check, qui détecte qu'un graphe a changé mais pas
 * qu'il est cassé. Pour chaque page de dist :
 *
 *  - un seul bloc application/ld+json, qui parse et porte @context + @graph ;
 *  - tout nœud du @graph porte un @id et un @type ;
 *  - les @id d'un même @graph sont uniques ;
 *  - toute référence { '@id': … } vers le site résout vers un nœud du graphe
 *    (la règle qui attrape les références pendantes).
 *
 *   node scripts/schema-check.mjs [buildDir]
 */
import { readFile, readdir } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import { JSDOM } from 'jsdom'

const BUILD_DIR = process.argv[2] || 'dist'

const findHtml = async (dir) => {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...await findHtml(p))
    else if (entry.isFile() && entry.name === 'index.html') out.push(p)
  }
  return out
}

/**
 * Tous les { '@id': … } atteignables depuis un nœud, nœud lui-même exclu.
 * Une référence est un objet dont '@id' est la seule clé signifiante : un nœud
 * complet porte aussi un '@type'.
 */
const collectRefs = (value, out) => {
  if (Array.isArray(value)) {
    for (const v of value) collectRefs(v, out)
    return
  }
  if (!value || typeof value !== 'object') return
  if (typeof value['@id'] === 'string' && value['@type'] === undefined) out.add(value['@id'])
  for (const [k, v] of Object.entries(value)) {
    if (k !== '@id') collectRefs(v, out)
  }
}

const main = async () => {
  const pages = await findHtml(BUILD_DIR)
  const errors = []
  let checked = 0

  for (const path of pages) {
    const rel = relative(BUILD_DIR, path).split(sep).join('/')
    const route = '/' + rel.replace(/index\.html$/, '')
    const dom = new JSDOM(await readFile(path, 'utf8'))
    const doc$ = dom.window.document
    const blocks = [...doc$.querySelectorAll('script[type="application/ld+json"]')]
    // Origine du site lue sur la page elle-même : le script reste autonome,
    // et scripts/ ne lit jamais src/config/site.ts autrement qu’en texte.
    const canonical = doc$.querySelector('link[rel="canonical"]')?.href
    const origin = canonical ? new URL(canonical).origin : null

    // Une page sans JSON-LD est un choix assumé (404) — on ne l'invente pas.
    if (blocks.length === 0) continue
    if (blocks.length > 1) {
      errors.push(`${route} : ${blocks.length} blocs JSON-LD, un seul attendu`)
      continue
    }

    let doc
    try {
      doc = JSON.parse(blocks[0].textContent)
    }
    catch (err) {
      errors.push(`${route} : JSON-LD illisible — ${err.message}`)
      continue
    }

    if (!doc['@context']) errors.push(`${route} : @context absent`)
    const graph = doc['@graph']
    if (!Array.isArray(graph) || graph.length === 0) {
      errors.push(`${route} : @graph absent ou vide`)
      continue
    }

    const ids = new Set()
    for (const [i, node] of graph.entries()) {
      const at = node?.['@id']
      if (typeof at !== 'string') {
        errors.push(`${route} : nœud #${i} sans @id`)
        continue
      }
      if (node['@type'] === undefined) errors.push(`${route} : ${at} sans @type`)
      if (ids.has(at)) errors.push(`${route} : @id dupliqué — ${at}`)
      ids.add(at)
    }

    const refs = new Set()
    for (const node of graph) collectRefs(node, refs)
    for (const ref of refs) {
      // Les références externes (fiche GBP, profils) sortent du graphe par
      // construction : seules celles qui visent le site doivent résoudre.
      if (!origin || !ref.startsWith(origin)) continue
      if (!ids.has(ref)) errors.push(`${route} : référence pendante — ${ref}`)
    }

    checked += 1
  }

  if (errors.length) {
    console.error('\nschema-check — graphe schema.org incohérent\n')
    for (const e of errors) console.error(`  ✗ ${e}`)
    console.error(`\n  ${errors.length} problème(s) — corrige avant de déployer.\n`)
    process.exit(1)
  }
  console.log(`schema-check: ✓ graphe schema.org valide sur ${checked} pages`)
}

main().catch((err) => { console.error(err); process.exit(2) })
