/**
 * scripts/static-server.mjs
 * Helpers partagés par a11y-runtime.mjs, lighthouse-audit.mjs et
 * export-plaquette.mjs.
 *
 *  - MIME           : table content-type pour servir dist
 *  - startServer    : serveur HTTP statique éphémère sur un port libre
 *  - discoverRoutes : liste les routes prerendered (un index.html par route)
 *
 * Les routes auditées sont découvertes dans dist : une nouvelle page est
 * couverte sans liste à tenir.
 */
import http from 'node:http'
import { readFile, readdir, stat } from 'node:fs/promises'
import { join, extname, relative, sep } from 'node:path'

export const PUBLIC_DIR = 'dist'

export const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.pdf': 'application/pdf',
  '.wasm': 'application/wasm',
}

/**
 * Démarre un serveur HTTP statique sur 127.0.0.1:<port libre> servant publicDir
 * (fallback index.html sur les répertoires, 404 sinon).
 * @returns {Promise<{ server: import('node:http').Server, port: number }>}
 */
export const startServer = (publicDir = PUBLIC_DIR) => new Promise((resolve) => {
  const server = http.createServer(async (req, res) => {
    let path = decodeURIComponent((req.url || '/').split('?')[0])
    if (path.endsWith('/')) path += 'index.html'
    let abs = join(publicDir, path)
    try {
      const s = await stat(abs).catch(() => null)
      if (s?.isDirectory()) abs = join(abs, 'index.html')
      const file = await readFile(abs)
      res.writeHead(200, { 'content-type': MIME[extname(abs)] || 'application/octet-stream' })
      res.end(file)
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain' })
      res.end('404')
    }
  })
  server.listen(0, '127.0.0.1', () => {
    const port = /** @type {{ port: number }} */ (server.address()).port
    resolve({ server, port })
  })
})

/** Liste récursivement les index.html sous dir (un par route prerendered). */
async function findIndexHtml(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...await findIndexHtml(p))
    else if (entry.isFile() && entry.name === 'index.html') out.push(p)
  }
  return out
}

/**
 * Routes prerendered sous publicDir, triées. '/' pour la racine ; séparateurs
 * normalisés en '/' pour rester correct sous Windows (path.join → antislash).
 * @returns {Promise<string[]>}
 */
export const discoverRoutes = async (publicDir = PUBLIC_DIR) => {
  const files = await findIndexHtml(publicDir)
  return files
    .map((f) => {
      const rel = relative(publicDir, f).split(sep).join('/')
      const route = ('/' + rel.replace(/index\.html$/, '')).replace(/\/$/, '')
      return route || '/'
    })
    .sort()
}
