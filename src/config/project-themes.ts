export interface ProjectTheme {
  num: string
  title: string
  /** Short pitch — used on the plaquette (sheet 05). */
  short: string
  /** Detailed description — used on the /projets page. */
  long: string
}

// Source of truth for the 3 « Jouons Ensemble ! » themes (SESSAD Lékoklaya, 2026).
// Source : fiche projet interne 2026 (non versionnée).
export const PROJECT_THEMES: ProjectTheme[] = [
  {
    num: '01',
    title: 'Coopération',
    short: 'Jeux choisis pour valoriser l’entraide et la stratégie partagée. Pont avec un jeu traditionnel + un conte sur le même thème.',
    long: 'Jeux choisis avec le médiateur numérique pour valoriser l’entraide et la stratégie partagée. L’intervenant culturel propose en parallèle un jeu traditionnel et un conte sur la coopération.',
  },
  {
    num: '02',
    title: 'Émotions & récits',
    short: 'Renforcement des fonctions exécutives (planification, inhibition, prise de décision) via des jeux narratifs.',
    long: 'Travail sur les fonctions exécutives (planification, inhibition, prise de décision) à travers des jeux narratifs. Le temps d’échange verbal explore ce que l’enfant a ressenti, nommé, partagé pendant la séance.',
  },
  {
    num: '03',
    title: 'Différence & complémentarité',
    short: 'Faire de la différence parent-enfant un levier d’alliance plutôt qu’une source de tension.',
    long: 'Comprendre comment chaque membre du binôme parent-enfant joue, observe, contribue — et faire de cette différence un levier d’alliance plutôt qu’une source de tension.',
  },
]
