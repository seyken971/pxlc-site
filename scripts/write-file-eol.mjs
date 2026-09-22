/**
 * scripts/write-file-eol.mjs
 * Écriture de fichier générée en respectant l'EOL existant.
 *
 * Sur les checkouts Windows (core.autocrlf=true) les fichiers sont en CRLF
 * alors que les scripts génèrent du LF — écrire du LF churnerait le fichier
 * dans git à chaque run. Utilisé par les scripts générateurs.
 */
import { readFile, writeFile } from 'node:fs/promises'

/**
 * Écrit contentLF (fins de ligne \n) dans path en reprenant l'EOL du fichier
 * existant, et seulement si le contenu change.
 * @returns {Promise<boolean>} true si le fichier a été écrit, false s'il était à jour.
 */
export async function writeFilePreservingEol(path, contentLF) {
  let existing = null
  try { existing = await readFile(path, 'utf8') }
  catch (err) { if (err.code !== 'ENOENT') throw err }

  const content = existing?.includes('\r\n')
    ? contentLF.replace(/\n/g, '\r\n')
    : contentLF

  if (content === existing) return false
  await writeFile(path, content, 'utf8')
  return true
}
