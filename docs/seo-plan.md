# PXLC — Plan SEO consolidé

> Document de travail interne (pas du contenu site). Révisé le 26 août 2026,
> après la suppression du blog : les vagues de contenu, les briefs et les
> piliers de maillage qui structuraient ce plan n'ont plus de support. Ne
> subsistent ici que les décisions qui engagent encore le site.

## 1. Stratégie

Conversion B2B locale : capter les structures qui accueillent des familles
(structures = clientes, familles = bénéficiaires) sur les pages `/projets/` et
`/contact/`, avec la preuve par les cas pratiques SESSAD.

Le volet « autorité parentale », qui reposait sur un blog d'articles sourcés
HCSP, est abandonné avec le blog (26 août 2026). Le site tient désormais en
5 pages : accueil, projets, à propos, contact, mentions légales.

## 2. Décisions figées (ne pas re-litiguer)

- **Crawlers IA** : posture « bloquer l'entraînement / autoriser la recherche »
  via des groupes explicites dans `public/robots.txt`, maintenu à la main. Pas
  de Content-Signal (coûte 8 points Lighthouse).
- **Mesure** : Google Search Console uniquement. Site statique GitHub Pages,
  pas d'analytics runtime.
- **Funnel** : RDV-first — « Réserver un échange de 20 min » (lien de rendez-vous, `IDENTITY.bookingUrl`) est l'unique action
  de conversion primaire ; devis et plaquette en secondaire.
- **Local** : fiche Google Business Profile vérifiée, liée au nœud schema
  `#identity`. Entité GBP = « PXLC - Médiation numérique », `site.name` = « PXLC ».
- **Limites meta** : title effectif ≤ 53 caractères (avant le suffixe
  « · PXLC »), description effective ≤ 120. Source unique dans
  `scripts/seo-limits.mjs`, appliquée par ds-lint R7 aux objets `seo` des
  pages et à `src/config/site.ts`.
- **Trailing slash** : activé (alignement canonical/sitemap avec GitHub Pages,
  qui 301-redirige la forme sans slash).
- **Graphe schema.org** : écrit à la main dans `src/lib/schema.ts`, typé par
  `schema-dts`. Pas de module générateur — la sortie de `nuxt-schema-org`
  avait laissé des scories (nœud dupliqué, `ReadAction`, `@id` machine)
  retirées le 26 août 2026.
- **Carte OG** : une seule carte de marque, `/og/site.png`, rendue par satori +
  resvg en PNG 1200×675 (16:9, depuis le 6 septembre 2026). JPEG écarté : sur un
  aplat de couleurs, PNG est plus léger et sans artéfacts, et l'ajout de sharp
  ne se justifie pas. URL versionnée par query (`?v=…`) pour purger les caches sociaux à
  chaque changement visuel : LinkedIn garde une image environ 7 jours sous une
  URL donnée (constaté le 6 septembre 2026, aperçu flou après le passage en 16:9).
- **Titre de l'accueil** (6 septembre 2026) : « Écrans en famille : médiation numérique en
  Guadeloupe » — le sujet devant, la catégorie et le territoire derrière. Seul,
  « médiation numérique » renvoie pour le grand public à l'inclusion numérique
  (conseillers numériques France Services, réseau ANCT), pas à l'accompagnement
  des familles autour des écrans. Le h1 du hero suit la même logique depuis le
  4 octobre 2026 : « Accompagner les familles autour des écrans. », la
  catégorie et le territoire passant en eyebrow (« Médiation numérique ·
  Guadeloupe »). Décidé sans données Search Console : à réévaluer avec les
  requêtes.
- **IndexNow** : soumission depuis `npm run release` (`scripts/indexnow.mjs`),
  après la vérification de la prod, des seules pages dont le `lastmod` porte le
  commit de fusion — la spec demande de ne soumettre que les URL modifiées.
  Clé publique servie à `/<clé>.txt`, exigée par check-links. Couvre Bing,
  Yandex, Naver et Seznam ; Google n'y participe pas, la mesure reste la Search
  Console. Jamais bloquant ; `npm run indexnow -- --all` resoumet tout.
- **`@jdevalk/astro-seo-graph`** (évalué le 6 septembre 2026, v2.2.0) : non
  adopté. Son `<Seo>` remplacerait `SiteHead` et son graphe générique
  (WebSite, WebPage, Person, BlogPosting, BreadcrumbList) couvre moins que
  `schema.ts` : `['Organization', 'ProfessionalService']` avec `areaServed`
  (Guadeloupe + 4 communes), `geo`, `hasMap`, RCS/SIREN/NAF en `PropertyValue`,
  `Service` avec `BusinessAudience`, `sameAs` scindé Organization / Person,
  WebPage multi-typé, FAQ en nœuds `Question` à `@id` stables. Ses validations
  de build sont déjà couvertes (h1 unique, title et description uniques, alt :
  seo-lint ; longueurs : ds-lint R7, plus strict ; slash final et liens internes :
  check-links). Le brancher casserait le hash CSP calculé sur la chaîne JSON-LD
  exacte, la vérification des `@id` pendants de schema-check et la baseline.
  Repris de son guide malgré tout : les règles de seo-lint, le canonical omis sur
  noindex, la carte OG en 16:9 et l'idée de soumission IndexNow incrémentale.

## 3. Non-régression

`docs/seo-baseline/` fait foi : canonical, title, metas, og/twitter, JSON-LD
trié, sitemap et robots.txt de chaque page. Protocole dans `CLAUDE.md` — tout
delta se déclare dans la PR, puis la baseline se recapture.

## 4. Mesure

Google Search Console, revue manuelle. Points d'attention connus :

- Un « 500 » affiché par Google est une entrée d'index périmée, pas un bug
  vivant — vérifier le 200 en direct, puis demander une indexation.
- Les pages non indexées de juillet 2026 étaient un problème de trailing
  slash, résolu le 13 juillet.
- La suppression du blog retire ~20 URL de l'index. Elles répondront 404
  (GitHub Pages ne permet ni 410 ni redirection serveur) : la désindexation
  se fera au rythme des recrawls, sans action possible côté site.
