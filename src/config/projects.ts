export interface Project {
  /** Ancre de la carte sur /projets/ et clé de tri. */
  slug: string
  name: string
  /** Nom donné au projet par la structure d’accueil, s’il diffère. */
  localName?: string
  place: string
  year: string
  /** « En cours », « Terminé » — ce qui distingue une rubrique d'un catalogue. */
  status: string
  /** Qui porte le projet dans la structure d'accueil. */
  owner: string
  audience: string
  team: string
  framework: string
  summary: string
  /** D'où vient le projet : le besoin constaté par la structure. */
  origin?: string
}

// Source of truth for the /projets rubric. Ajouter un projet = ajouter un
// objet ici — pas de collection de contenu tant que la rubrique tient en
// quelques entrées.
// Faits confirmés : fiche projet interne 2026 (Box, non versionnée).
export const PROJECTS: Project[] = [
  {
    slug: 'jouons-ensemble',
    name: 'Parent-Écran-Enfant',
    localName: 'Jouons Ensemble\u00A0!',
    place: 'SESSAD Lékoklaya, Les Abymes',
    year: '2026',
    status: 'En cours',
    owner: 'Le psychologue du SESSAD',
    audience: '8 enfants de 12 à 17 ans, en binôme avec un parent',
    team: 'Psychologue, psychomotricienne, intervenant culturel, médiateur numérique',
    framework: 'HCSP 2019-2020 · HAS 2020',
    summary: 'Un cycle d’ateliers parent-enfant conduit avec l’équipe pluridisciplinaire du SESSAD, du diagnostic familial au bilan écrit.',
    origin: 'Le point de départ : le jeu vidéo revenait systématiquement dans les entretiens familiaux comme source de conflit. Dans la continuité du Café-Parents « Enfants Écrans » de décembre 2023, le projet transforme ces tensions en matériau de travail pour l’équipe.',
  },
]
