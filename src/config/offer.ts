import { ZONE } from './site'

// Source unique de l'offre telle que la présentent l'accueil et la plaquette
// (feuille 02) : à qui elle s'adresse, ce que comprend une intervention.
// Uniquement des faits publiés et confirmés par Andy — tarif et nombre de
// séances restent « sur devis » tant qu'il ne les a pas fixés.

export interface Audience {
  title: string
  items: string[]
}

/** Structures clientes, par famille (liste « Clients » du design system). */
export const AUDIENCES: Audience[] = [
  { title: 'Lecture publique et vie sociale', items: ['Médiathèques et bibliothèques', 'Centres sociaux et espaces de vie sociale', 'CCAS et dispositifs de réussite éducative'] },
  { title: 'Éducation et parentalité', items: ['Écoles et centres socioculturels', 'Dispositifs CLAS', 'Lieux d’accueil enfants-parents (LAEP)'] },
  { title: 'Médico-social', items: ['SESSAD', 'IME', 'CMPP', 'CAMSP'] },
]

export interface PracticeFact {
  key: 'format' | 'seance' | 'restitution' | 'cadre' | 'materiel' | 'zone' | 'tarif' | 'demarrage'
  label: string
  value: string
}

/** Ce que comprend une intervention. */
export const PRACTICE: PracticeFact[] = [
  { key: 'format', label: 'Format', value: 'Ateliers parent-enfant, conduits avec l’équipe de votre structure' },
  { key: 'seance', label: 'Une séance', value: 'Un temps de jeu partagé (30 à 45\u00A0min), puis un temps d’échange (45\u00A0min à 1\u00A0h)' },
  { key: 'restitution', label: 'Restitution', value: 'Un bilan écrit, remis à l’équipe et discuté avec elle, réutilisable dans vos rapports d’activité' },
  { key: 'cadre', label: 'Cadre', value: 'HCSP\u00A02019-2020 · HAS\u00A02020' },
  { key: 'materiel', label: 'Matériel', value: 'Consoles et jeux prêtés, ou pris en charge par la structure' },
  { key: 'zone', label: 'Zone', value: ZONE.join(', ') },
  { key: 'tarif', label: 'Tarif', value: 'Sur devis, selon le nombre d’ateliers, de familles et la durée' },
  { key: 'demarrage', label: 'Pour commencer', value: 'Un premier échange de 20\u00A0min, gratuit et sans engagement' },
]
