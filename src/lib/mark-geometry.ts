/**
 * Géométrie du logo PXLC — source unique.
 *
 * Lue par le composant `PxlcMark.astro`, la carte OG (`og-mark.ts`) et le
 * générateur des fichiers du logo (`scripts/build-logo.mjs`, via le type
 * stripping de Node : ce fichier ne doit rien importer et ne contenir que de
 * la syntaxe TypeScript effaçable).
 *
 * Design system « PXLC 2026 » : sur une grille 3×3 (côté 29,33, écart 4,
 * marge 2 dans un viewBox de 100), le parent occupe 2×2 cellules en haut à
 * gauche, l'enfant la cellule en bas à droite. Rayons ≈ 12 % du côté.
 * L'écart de 4 a été comparé à 6, 8 et 10 (09/2026) : en diagonale, les
 * coins arrondis séparent déjà nettement les deux carrés, même à 16 px ;
 * élargir l'écart ne faisait que rétrécir l'enfant.
 */

export const MARK_VIEWBOX = 100

export const MARK_PARENT = { x: 2, y: 2, size: 62.66, rx: 7.5 } as const
export const MARK_CHILD = { x: 68.67, y: 68.67, size: 29.33, rx: 3.5 } as const

/**
 * Zone de protection du design system : un demi petit carré sur chaque côté
 * du dessin (qui occupe 2 → 98 dans le viewBox).
 */
export const MARK_CLEARSPACE = MARK_CHILD.size / 2

/**
 * Versions dessinées au pixel pour les favicons, où l'antialiasing d'une
 * mise à l'échelle rendrait les bords flous : coordonnées entières, même
 * rapport enfant / parent (≈ 0,47).
 */
export const MARK_PIXEL_GRID = {
  16: { parent: { x: 0, y: 0, size: 10, rx: 1.2 }, child: { x: 11, y: 11, size: 5, rx: 0.6 } },
  32: { parent: { x: 1, y: 1, size: 19, rx: 2.3 }, child: { x: 22, y: 22, size: 9, rx: 1.1 } },
} as const
