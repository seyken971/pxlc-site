#!/usr/bin/env node
/**
 * scripts/export-plaquette.mjs
 * Imprime la page /plaquette/ du build en PDF A4 → public/files/plaquette-pxlc.pdf
 *
 *   npm run plaquette              # build + export
 *   node scripts/export-plaquette.mjs [--previews]
 *
 * La plaquette est une page du site (src/pages/plaquette.astro, rendue par
 * PlaquetteLayout) : mêmes tokens, composants et polices que le reste. Ce
 * script sert dist/ sur un port libre (static-server.mjs), ouvre la page dans
 * le Chromium de Playwright — déjà installé pour l'audit a11y — et imprime en
 * média print (la toolbar écran disparaît). Le PDF est un binaire committé,
 * servi tel quel par GitHub Pages : la CI ne le régénère pas, toute
 * modification de la page se relance et se committe avec lui.
 *
 * Garde-fous (exit 1) :
 *  - texte de la couleur de son fond (ex. encre sombre sur carte sombre) ;
 *  - contenu qui passe sous le pied de feuille (la feuille masque son
 *    débordement : à l'écran on ne voit rien, à l'impression le texte est coupé) ;
 *  - nombre de pages différent de la valeur attendue.
 *
 * --previews : un PNG par feuille dans .previews/ (gitignoré), en média print,
 * pour comparer visuellement deux éditions.
 */
import { chromium } from 'playwright'
import { PDFDocument } from 'pdf-lib'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { startServer } from './static-server.mjs'

const ROUTE = '/plaquette/'
const EXPECTED_PAGES = 6
const OUT_DIR = join('public', 'files')
const PDF_OUT = join(OUT_DIR, 'plaquette-pxlc.pdf')
const PDF_TMP = join(OUT_DIR, `plaquette-pxlc.${process.pid}.tmp.pdf`)
const PREVIEWS_DIR = '.previews'
const PREVIEWS = process.argv.includes('--previews')

// Mots-clés du dictionnaire Info du PDF — le reste des métadonnées est lu
// dans la page rendue (title, author, og:description), une seule source.
const KEYWORDS = [
  'médiation numérique', 'écrans', 'famille', 'parent-enfant', 'jeu vidéo', 'Guadeloupe',
  'structures', 'médiathèque', 'centre social', 'école', 'CCAS', 'SESSAD', 'IME',
]

const fail = (msg) => { console.error(`export-plaquette: ✗ ${msg}`); process.exit(1) }

const main = async () => {
  const { server, port } = await startServer()
  const browser = await chromium.launch()
  let meta
  try {
    const context = await browser.newContext({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 })
    const page = await context.newPage()
    const response = await page.goto(`http://127.0.0.1:${port}${ROUTE}`, { waitUntil: 'networkidle' })
    if (!response?.ok()) fail(`${ROUTE} répond ${response?.status()} — lancer npm run build d'abord`)
    await page.evaluate(() => document.fonts.ready)

    // Garde-fou : aucun texte ne doit avoir la couleur de son fond.
    const invisible = await page.evaluate(() => {
      const bgOf = (el) => {
        for (let e = el; e; e = e.parentElement) {
          const c = getComputedStyle(e).backgroundColor
          if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c
        }
        return 'rgb(255, 255, 255)'
      }
      const out = []
      for (const el of document.querySelectorAll('.pq-page *')) {
        const ownText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())
        if (!ownText) continue
        if (getComputedStyle(el).color === bgOf(el)) {
          const cls = el.className ? '.' + String(el.className).split(' ').join('.') : ''
          out.push(`<${el.tagName.toLowerCase()}${cls}> « ${el.textContent.trim().slice(0, 70)} »`)
        }
      }
      return out
    })
    if (invisible.length) {
      console.error('export-plaquette: ✗ texte invisible (couleur identique au fond) :')
      for (const l of invisible) console.error(`  · ${l}`)
      process.exit(1)
    }

    // Garde-fou : rien ne déborde sous le pied de feuille. La feuille masque
    // son débordement (overflow hidden), le compte de pages ne le voit donc
    // pas — on compare la géométrie de chaque bloc au haut du pied.
    const overflow = await page.evaluate(() => {
      const out = []
      document.querySelectorAll('.pq-page').forEach((sheet, i) => {
        const sheetBox = sheet.getBoundingClientRect()
        const foot = sheet.querySelector('.pq-page__foot')
        const limit = foot ? foot.getBoundingClientRect().top - 1 : sheetBox.bottom - 1
        for (const el of sheet.querySelectorAll('*')) {
          if (foot && (el === foot || foot.contains(el))) continue
          const ownText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())
          if (!ownText) continue
          const bottom = el.getBoundingClientRect().bottom
          if (bottom > limit) {
            out.push(`feuille ${String(i + 1).padStart(2, '0')} : <${el.tagName.toLowerCase()}> « ${el.textContent.trim().slice(0, 60)} » dépasse de ${Math.round(bottom - limit)} px`)
            break
          }
        }
      })
      return out
    })
    if (overflow.length) {
      console.error('export-plaquette: ✗ contenu sous le pied de feuille :')
      for (const l of overflow) console.error(`  · ${l}`)
      process.exit(1)
    }

    meta = await page.evaluate(() => ({
      title: document.title,
      author: document.querySelector('meta[name="author"]')?.content ?? '',
      subject: document.querySelector('meta[property="og:description"]')?.content ?? '',
      lang: document.documentElement.lang,
    }))

    if (PREVIEWS) {
      // Média print : les aperçus montrent ce que page.pdf() imprimera
      // (toolbar masquée, fond blanc, pas d'ombre).
      await page.emulateMedia({ media: 'print' })
      await rm(PREVIEWS_DIR, { recursive: true, force: true })
      await mkdir(PREVIEWS_DIR, { recursive: true })
      const sheets = await page.locator('.pq-page').all()
      for (const [i, sheet] of sheets.entries()) {
        const out = join(PREVIEWS_DIR, `page-${String(i + 1).padStart(2, '0')}.png`)
        await sheet.screenshot({ path: out, type: 'png' })
        console.log(`  → ${out}`)
      }
    }

    await mkdir(OUT_DIR, { recursive: true })
    await page.pdf({ path: PDF_TMP, format: 'A4', printBackground: true, preferCSSPageSize: true })
    await context.close()
  }
  finally {
    await browser.close()
    server.close()
  }

  // Métadonnées : Chromium ne reporte que le <title> et expose son user-agent
  // en Creator — on réécrit le dictionnaire Info pour un document propre.
  const doc = await PDFDocument.load(await readFile(PDF_TMP), { updateMetadata: false })
  const pages = doc.getPageCount()
  if (pages !== EXPECTED_PAGES) {
    await rm(PDF_TMP, { force: true })
    fail(`${pages} pages dans le PDF, ${EXPECTED_PAGES} attendues — une feuille déborde`)
  }
  doc.setTitle(meta.title)
  doc.setAuthor(meta.author ? `${meta.author} — PXLC` : 'PXLC')
  doc.setSubject(meta.subject)
  doc.setKeywords(KEYWORDS)
  doc.setCreator('PXLC — pxlc.fr')
  doc.setProducer('PXLC — pxlc.fr')
  doc.setLanguage(meta.lang || 'fr-FR')
  doc.setModificationDate(new Date())
  await writeFile(PDF_TMP, await doc.save())
  await rename(PDF_TMP, PDF_OUT)

  console.log(`export-plaquette: ✓ ${PDF_OUT} (${pages} pages, « ${meta.title} »)`)
}

main().catch((err) => { console.error(err); process.exit(2) })
