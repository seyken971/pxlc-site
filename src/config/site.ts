// Source unique d'identité du site. Consommée par les layouts, SiteHead, les
// builders schema.org et, en texte, par des scripts Node (ds-lint R7).
export const SITE = {
  url: 'https://pxlc.fr',
  name: 'PXLC',
  description:
    'Andy Zébus, créateur de PXLC, aide les structures en Guadeloupe à accompagner les familles autour des écrans.',
  lang: 'fr-FR',
  locale: 'fr_FR',
  author: 'Andy Zébus',
  twitter: '@seyken971',
  // Suffixe appliqué par SiteHead à chaque titre de page (%s · PXLC).
  // Budget : titre de page ≤ 53 caractères pour un <title> complet ≤ 60.
  titleSuffix: ' · PXLC',
} as const

// Zone d'intervention en présentiel : source unique de l'accueil, de
// /a-propos/, de la carte de /contact/ et de `areaServed` (#identity).
// L'ordre fixe les numéros de la légende de la carte.
export const ZONE = ['Les Abymes', 'Pointe-à-Pitre', 'Baie-Mahault', 'Le Gosier'] as const
