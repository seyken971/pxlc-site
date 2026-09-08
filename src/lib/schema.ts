/**
 * Graphe schema.org du site. Un seul bloc JSON-LD par page, émis par
 * BaseLayout, vérifié contre les fixtures docs/seo-baseline/ et contre les
 * invariants de scripts/schema-check.mjs (postbuild).
 *
 * Ordre du @graph :
 *   #website · #webpage · #identity · #andy · #service · [nœuds Question] ·
 *   [BreadcrumbList] · #photo-event · #logo · #photo-andy
 *
 * Le graphe a d'abord été transcrit de nuxt-schema-org ; ses scories
 * (#organization dupliqué, ReadAction, primaryImageOfPage, @id machine)
 * ont été retirées depuis.
 */
import { createLastmod } from '../../scripts/sitemap-lastmod.mjs'
import { SITE } from '../config/site'
import { IDENTITY, RCS_MENTION, SIREN_COMPACT, SIRET_COMPACT } from '../config/identity'
import type { Crumb } from './breadcrumb'
import type {
  BreadcrumbList,
  ImageObject,
  Person,
  PostalAddress,
  ProfessionalService,
  Question,
  Service,
  WebPage,
  WebSite,
} from 'schema-dts'

const URL_BASE = SITE.url
const LANG = SITE.lang

/**
 * `dateModified` des WebPage : date du dernier commit touchant le fichier de
 * la page — même source que le <lastmod> du sitemap, donc mêmes limites (sur
 * un clone superficiel, tout retombe sur l'horodatage du build). Une seule
 * instance au niveau module : createLastmod sonde git une fois puis met en
 * cache, l'appeler par page relancerait le sondage.
 */
const lastModified = createLastmod(new Date().toISOString())

/**
 * @id des nœuds globaux. Les pages s'y réfèrent plutôt que de réécrire une
 * URL absolue : c'était le seul endroit où SITE.url était dupliqué hors config.
 */
export const ID = {
  andy: `${URL_BASE}/#andy`,
  identity: `${URL_BASE}/#identity`,
  logo: `${URL_BASE}/#logo`,
  photoAndy: `${URL_BASE}/#photo-andy`,
  photoEvent: `${URL_BASE}/#photo-event`,
  service: `${URL_BASE}/#service`,
  website: `${URL_BASE}/#website`,
} as const

// Les nœuds sont typés un par un avec schema-dts (paquet Google) : une
// propriété mal orthographiée ou absente du type casse le `typecheck`, plus
// la relecture. Le @graph lui-même reste un tableau d'objets — mélanger des
// types schema-dts hétérogènes dans un même tableau ne tient pas.
type GraphNode = object

/** schema-dts autorise `string` partout où un type est attendu — pas ici. */
type Entity<T> = Exclude<T, string>

/** Nœud du @graph : un type schema-dts + le @id que schema-dts n'impose pas. */
type Node<T, E = Entity<T>> = E extends unknown ? E & { '@id': string } : never

/**
 * schema.org autorise un nœud à cumuler plusieurs @type, pas schema-dts.
 * On garde le contrôle des propriétés de T et on rouvre le seul @type.
 */
type MultiType<T, U, E = Entity<T>> = E extends unknown
  ? Omit<E, '@type'> & { '@id': string, '@type': U }
  : never

/**
 * Types de page réellement émis. L'union est fermée volontairement : quand
 * `type` valait `string`, une faute de frappe ('AboutPge') passait le
 * typecheck alors que tout le reste du fichier est contraint par schema-dts.
 */
export type PageType = 'WebPage' | 'AboutPage' | 'ContactPage' | 'FAQPage'

// ── Nœuds globaux (identiques sur toutes les pages) ─────────────────────────

const websiteNode: Node<WebSite> = {
  '@id': ID.website,
  '@type': 'WebSite',
  'alternateName': IDENTITY.brandName,
  'description': SITE.description,
  'inLanguage': LANG,
  'name': 'PXLC',
  'publisher': { '@id': ID.identity },
  'url': `${URL_BASE}/`,
}

const postalAddress: PostalAddress = {
  '@type': 'PostalAddress',
  'addressCountry': IDENTITY.address.country,
  'addressLocality': IDENTITY.address.locality,
  'addressRegion': IDENTITY.address.region,
  'postalCode': IDENTITY.address.postalCode,
  'streetAddress': IDENTITY.address.street,
}

// ProfessionalService = sous-type LocalBusiness le plus précis pour une
// prestation de médiation sans point de vente. Données reprises verbatim de
// l'ancien defineLocalBusiness (nuxt.config.ts) — cohérence NAP avec la fiche
// Google Business Profile.
//
// Le double @type est redondant sur le papier (ProfessionalService hérite déjà
// d'Organization via LocalBusiness) : il est gardé pour les consommateurs qui
// ne connaissent que les types de premier niveau. Ne pas le « simplifier ».
const identityNode: MultiType<ProfessionalService, ['Organization', 'ProfessionalService']> = {
  '@id': ID.identity,
  '@type': ['Organization', 'ProfessionalService'],
  'address': postalAddress,
  'areaServed': [
    { '@type': 'AdministrativeArea', 'name': 'Guadeloupe' },
    { '@type': 'City', 'name': 'Les Abymes' },
    { '@type': 'City', 'name': 'Pointe-à-Pitre' },
    { '@type': 'City', 'name': 'Baie-Mahault' },
    { '@type': 'City', 'name': 'Le Gosier' },
  ],
  'contactPoint': {
    '@type': 'ContactPoint',
    'availableLanguage': 'fr',
    'contactType': 'customer service',
    'email': IDENTITY.email,
    'telephone': IDENTITY.telephone,
  },
  'description': 'PXLC accompagne les familles autour des écrans. Médiation numérique en Guadeloupe, portée par Andy Zébus, auprès des structures qui accompagnent des familles.',
  'email': IDENTITY.email,
  'founder': { '@id': ID.andy },
  'foundingDate': '2015',
  'geo': { '@type': 'GeoCoordinates', 'latitude': 16.1496296, 'longitude': -61.39705 },
  'hasMap': 'https://maps.app.goo.gl/4UPhQWdzboD6HnAs8',
  // Immatriculations. PropertyValue plutôt que taxID, déjà pris par le SIRET.
  // propertyID porte le référentiel, value la valeur du référentiel — donc la
  // forme compacte pour le SIREN, sauf pour le RCS dont la mention publiée
  // associe la ville au numéro.
  'identifier': [
    { '@type': 'PropertyValue', 'propertyID': 'RCS', 'value': RCS_MENTION },
    { '@type': 'PropertyValue', 'propertyID': 'SIREN', 'value': SIREN_COMPACT },
    { '@type': 'PropertyValue', 'propertyID': 'NAF', 'value': IDENTITY.ape },
  ],
  'image': { '@id': ID.photoEvent },
  'legalName': IDENTITY.legalName,
  'logo': { '@id': ID.logo },
  // Rattache #service à l'entité. Sans cette arête, le nœud Service ne serait
  // référencé que par le `about` de /projets/ et flotterait sur les autres
  // pages.
  'makesOffer': { '@type': 'Offer', 'itemOffered': { '@id': ID.service } },
  'name': IDENTITY.brandName,
  // Mêmes horaires que la fiche Google Business Profile. schema-dts attend les
  // jours sous leur forme URL (DayOfWeek), Google accepte les deux.
  'openingHoursSpecification': {
    '@type': 'OpeningHoursSpecification',
    'closes': IDENTITY.openingHours.closes,
    'dayOfWeek': IDENTITY.openingHours.days.map(d => `https://schema.org/${d}` as const),
    'opens': IDENTITY.openingHours.opens,
  },
  'sameAs': [
    'https://maps.app.goo.gl/4UPhQWdzboD6HnAs8',
    'https://www.linkedin.com/company/pxlc-mediation-numerique/',
  ],
  'taxID': SIRET_COMPACT,
  'telephone': IDENTITY.telephone,
  'url': `${URL_BASE}/`,
}

const andyNode: Node<Person> = {
  '@id': ID.andy,
  '@type': 'Person',
  'alumniOf': [
    { '@type': 'EducationalOrganization', 'name': 'Talis Business School (Paris)' },
    { '@type': 'EducationalOrganization', 'name': 'Université des Antilles' },
    { '@type': 'EducationalOrganization', 'name': 'Institut Supérieur Caraïbe (ISCA)' },
  ],
  'description': 'Médiateur numérique basé aux Abymes (Guadeloupe). Aide les structures — SESSAD, IME, associations, collectivités — à accompagner les familles autour des écrans : conflits autour du temps d’écran, bonnes pratiques numériques.',
  'hasCredential': [
    { '@type': 'EducationalOccupationalCredential', 'credentialCategory': 'Licence', 'name': 'Licence d’anglais, spécialité médiation interculturelle euro-caribéenne — Université des Antilles' },
  ],
  'hasOccupation': {
    '@type': 'Occupation',
    'name': 'Médiateur numérique',
    'occupationLocation': { '@type': 'AdministrativeArea', 'name': 'Guadeloupe' },
  },
  'image': { '@id': ID.photoAndy },
  'jobTitle': 'Médiateur numérique',
  'knowsAbout': [
    'Médiation numérique',
    'Médiation par le jeu vidéo',
    'Parentalité numérique',
    'esport',
    'Guadeloupe',
  ],
  'knowsLanguage': ['fr', 'en'],
  'name': 'Andy Zébus',
  // URL finales des profils, vérifiées au curl : sameAs ne doit pas désigner
  // une redirection. www.github.com, www.twitter.com et www.threads.net en
  // renvoyaient toutes une.
  'sameAs': [
    'https://www.linkedin.com/in/azebus',
    'https://github.com/seyken971',
    'https://www.instagram.com/seyken971',
    'https://www.youtube.com/@seyken971',
    'https://www.threads.com/@seyken971',
    'https://x.com/seyken971',
    'https://bsky.app/profile/seyken971.pxlc.fr',
    'https://www.facebook.com/seyken971',
  ],
  'url': `${URL_BASE}/a-propos/`,
  'worksFor': { '@id': ID.identity },
}

const serviceNode: Node<Service> = {
  '@id': ID.service,
  '@type': 'Service',
  'areaServed': { '@type': 'AdministrativeArea', 'name': 'Guadeloupe' },
  'audience': {
    '@type': 'BusinessAudience',
    'audienceType': ['SESSAD', 'IME', 'associations', 'collectivités'],
  },
  'description': 'Médiation numérique pour les structures qui accompagnent des familles en Guadeloupe. Résolution des conflits autour du temps d’écran, ateliers de bonnes pratiques, vulgarisation numérique.',
  'name': 'Médiation numérique - Programmes PXLC',
  'provider': { '@id': ID.identity },
  'serviceType': 'Médiation numérique',
  'url': `${URL_BASE}/projets/`,
}

// Dimensions déclarées d'après les fichiers de public/img/photos/, qui ne
// servent qu'au JSON-LD et à la fiche Google Business Profile — le site, lui,
// rend depuis src/assets/photos/. #photo-event a donc pu repasser à son
// original 2000x1331 sans toucher au rendu. #photo-andy reste à 738 px : sa
// source est une capture de plateau télé en 1600x738, c'est son plafond, et il
// reste sous les 1200 px que Google recommande. Mieux vaut la valeur juste
// qu'une promesse.
// schema.org type width/height en Distance | QuantitativeValue : un nombre nu
// n'est pas valide, d'où le QuantitativeValue en pixels (unitCode UN/CEFACT
// E37).
const px = (value: number) => ({ '@type': 'QuantitativeValue' as const, 'unitCode': 'E37', value })

const imageNode = (id: string, url: string, width: number, height: number): Node<ImageObject> => ({
  '@id': id,
  '@type': 'ImageObject',
  'contentUrl': url,
  'height': px(height),
  'inLanguage': LANG,
  'url': url,
  'width': px(width),
})

const logoNode: Node<ImageObject> = {
  '@id': ID.logo,
  '@type': 'ImageObject',
  'caption': IDENTITY.brandName,
  'contentUrl': `${URL_BASE}/logo.svg`,
  'height': px(512),
  'inLanguage': LANG,
  'url': `${URL_BASE}/logo.svg`,
  'width': px(512),
}

// ── Builders de page ────────────────────────────────────────────────────────

export interface WebPageOptions {
  /** Chemin avec slash final, ex. '/a-propos/'. */
  path: string
  type?: PageType | PageType[]
  name: string
  description: string
  /** @id du nœud visé par `about` (défaut : #identity). */
  aboutId?: string
  /** Fil d'Ariane de la page (breadcrumbItems) — ajoute le nœud + la réf. */
  crumbs?: Crumb[]
  /**
   * Nœuds Question (structures) — référencés via mainEntity. `id` porte le
   * fragment du @id : réordonner la FAQ ne doit pas réaffecter les @id à
   * d'autres questions, ce que faisait la numérotation par index.
   */
  questions?: { id: string, q: string, a: string }[]
}

const breadcrumbId = (pageUrl: string) => `${pageUrl}#breadcrumb`

const breadcrumbNode = (pageUrl: string, crumbs: Crumb[]): Node<BreadcrumbList> => ({
  '@id': breadcrumbId(pageUrl),
  '@type': 'BreadcrumbList',
  'itemListElement': crumbs.map((c, i) => ({
    '@type': 'ListItem',
    'item': c.href ? `${URL_BASE}${c.href}` : pageUrl,
    'name': c.label,
    'position': i + 1,
  })),
})

/** Graphe complet d'une page. */
export const pageGraph = (opts: WebPageOptions): GraphNode[] => {
  const pageUrl = `${URL_BASE}${opts.path}`
  const questionNodes = (opts.questions ?? []).map((f): Node<Question> => ({
    '@id': `${pageUrl}#faq-${f.id}`,
    '@type': 'Question',
    'acceptedAnswer': { '@type': 'Answer', 'text': f.a },
    'inLanguage': LANG,
    'name': f.q,
  }))

  const webpage: MultiType<WebPage, PageType | PageType[]> = {
    '@id': `${pageUrl}#webpage`,
    '@type': opts.type ?? 'WebPage',
    'about': { '@id': opts.aboutId ?? ID.identity },
    ...(opts.crumbs ? { breadcrumb: { '@id': breadcrumbId(pageUrl) } } : {}),
    'dateModified': lastModified(pageUrl),
    'description': opts.description,
    'inLanguage': LANG,
    'isPartOf': { '@id': ID.website },
    ...(questionNodes.length
      ? { mainEntity: questionNodes.map(q => ({ '@id': q['@id'] })) }
      : {}),
    'name': opts.name,
    'url': pageUrl,
  }

  return [
    websiteNode,
    webpage,
    identityNode,
    andyNode,
    serviceNode,
    ...questionNodes,
    ...(opts.crumbs ? [breadcrumbNode(pageUrl, opts.crumbs)] : []),
    imageNode(ID.photoEvent, `${URL_BASE}/img/photos/andy-event.jpg`, 2000, 1331),
    logoNode,
    imageNode(ID.photoAndy, `${URL_BASE}/img/photos/andy-portrait.jpg`, 738, 738),
  ]
}
