// Source unique des données d'identité légale (NAP + immatriculations) et du
// lien de rendez-vous. Les mêmes valeurs alimentent le JSON-LD
// (src/lib/schema.ts), la page des mentions légales, le chrome du site et la
// plaquette : toute divergence casse la cohérence NAP avec la fiche Google
// Business Profile, d'où la source unique.
// Note : contact.astro et a-propos.astro affichent encore ces valeurs en dur,
// mêlées à des libellés formatés — à câbler ici si elles bougent.
export const IDENTITY = {
  legalName: 'Andy Zébus - Entrepreneur Individuel',
  brandName: 'PXLC - Médiation numérique',
  siret: '813 793 528 00031',
  siren: '813 793 528',
  rcsCity: 'Pointe-à-Pitre',
  ape: '70.21Z',
  apeLabel: 'Conseil en relations publiques et communication',
  email: 'contact@pxlc.fr',
  // Format E.164 pour les liens tel: et le JSON-LD.
  telephone: '+590690717618',
  telephoneDisplay: '0690 71 76 18',
  // Lien de prise de rendez-vous : conversion primaire unique du site (header,
  // footer, menu mobile, pages, mentions légales, plaquette). Si l'outil change,
  // c'est ici et seulement ici — puis `npm run plaquette` pour régénérer le PDF.
  // Vyte (Vyte.in SAS, Paris), données hébergées en France. Forme avec www. :
  // la forme nue redirige en 301 vers http://www. puis https.
  bookingUrl: 'https://www.vyte.in/pxlc',
  bookingUrlDisplay: 'vyte.in/pxlc',
  address: {
    street: '8 Résidence la familiale, rue Man Manigard Alfred, Dugazon',
    postalCode: '97139',
    locality: 'Les Abymes',
    region: 'Guadeloupe',
    country: 'FR',
  },
  // Horaires publiés sur la fiche Google Business Profile (relevés le
  // 06/09/2026) : lundi à vendredi, fermé le week-end. Format HH:MM attendu
  // par schema.org (opens / closes).
  openingHours: {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '08:00',
    closes: '17:00',
  },
  // Première année de la mention « © 2015–… » du pied de page, reprise par le
  // copyrightYear du JSON-LD. Le titulaire des droits est Andy Zébus (section
  // « Propriété intellectuelle » des mentions légales).
  copyrightSince: 2015,
} as const

/** Mention RCS publiée, ex. « Pointe-à-Pitre 813 793 528 ». */
export const RCS_MENTION = `${IDENTITY.rcsCity} ${IDENTITY.siren}`

/**
 * Formes compactes des immatriculations, pour le JSON-LD : les référentiels
 * attendent une chaîne sans séparateur. Les mentions légales gardent la forme
 * espacée d’IDENTITY — même source, deux rendus.
 */
export const SIRET_COMPACT = IDENTITY.siret.replace(/ /g, '')
export const SIREN_COMPACT = IDENTITY.siren.replace(/ /g, '')
