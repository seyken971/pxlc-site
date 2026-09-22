# PXLC — pxlc-site

Site vitrine de PXLC (médiation numérique, Guadeloupe). Astro, site 100 %
statique déployé sur GitHub Pages (`dist/`), zéro JavaScript expédié hors
quelques scripts vanilla inline (thème, menu mobile, formulaire, filtres).

Mission en une phrase (à reprendre verbatim, seule phrase où PXLC est sujet) :
« PXLC accompagne les familles autour des écrans. »

Formule des descriptions (meta, OG, bios auteur) — ≤ 20 mots, cible puis
bénéfice : « Andy Zébus aide les structures (en Guadeloupe) à accompagner
les familles autour des écrans. »

Le contexte de positionnement et de stratégie vit dans `CLAUDE.local.md`
(non versionné) — le consulter quand il est présent.

## Voix : « je » vs « PXLC »

- **« je »** = Andy. Sujet des verbes d'action dans le copy des pages :
  j'anime, j'accompagne, j'interviens, je construis.
- **« PXLC »** = nom de marque, jamais sujet d'un verbe d'action dans le copy
  page (exception : la mission verbatim ci-dessus). Apparaît comme nom de
  l'offre : « les ateliers PXLC », « contacter PXLC ».
- **Meta, OG images, mentions légales, références tierces** : 3e personne OK
  (« Andy Zébus, créateur de PXLC, accompagne… »).
- Jamais « Andy Zébus accompagne » dans le copy des pages.
- Jamais « fondateur » → « créateur de PXLC ».

## Design system & règles de marque

@design-rules.md

- `design.md` (tokens, palette, classes CSS : la référence complète) et
  `design-rules.md` (les règles brand seules, importées ci-dessus) sont
  **générés** par `scripts/export-design.mjs` — ne jamais les éditer à la
  main. Sources : `src/styles/tokens.css` + `src/styles/styles.css`. Régénérés
  par `predev` et `prebuild` ; committer les versions à jour. Les valeurs de
  tokens se lisent dans `tokens.css` ou `design.md` quand on en a besoin.
- Contrat des composants : bloc `/** … */` en tête de frontmatter
  (description, `@usage`, `@a11y`) et JSDoc sur chaque prop de
  `interface Props` — `scripts/component-docs.mjs` en tire la section
  « Composants » de `design.md` ; `ds-lint` R13 (`doc-composant`) bloque tout
  manque (`@a11y` exigé pour `Pxlc*` et `Site*`).
- Toujours utiliser les custom properties (`--pxlc-*`, tokens sémantiques) —
  jamais de couleurs ou d'espacements en dur dans les composants.
- Dark mode via `[data-theme="dark"]` — toute nouvelle couleur sémantique doit
  avoir sa variante dark dans `tokens.css`.
- Les sections de `styles.css` sont délimitées par des commentaires
  `── Titre ──` — respecter ce format, le parser d'export-design en dépend.

## Garde-fous non négociables (copy)

Aussi dans design.md, mais bloquants — vérifier chaque texte généré ou modifié :

- Vocabulaire interdit : addiction, désintoxication, détox numérique, coach,
  expert, innovant, révolutionnaire. Fondement : l'avis HCSP du 08/03/2021
  relève que le terme « addiction » est contesté scientifiquement et que la
  MILDECA préfère « usage problématique des écrans » — utiliser ce terme.
- Pas d'emoji, nulle part (copy, code, commits, iconographie).
- Typographie française : espace insécable avant `!` `?` `:` `;` `»` et entre
  nombre + unité (`48 h`, `20 min`, `100 €`). Dans les sources : `&nbsp;` dans
  le balisage, `\u00A0` dans les template literals, U+00A0 littéral toléré
  dans les chaînes simples — garde-fou `ds-lint` R11.
- Cadre réglementaire : toujours citer « HCSP 2019-2020 · HAS 2020 » ensemble.
- Termes naked (sans guillemets ni traduction) : HCSP, SESSAD, TCND, TND,
  hyperfocus.
- Corpus de référence dans `docs/references/` (avis HCSP 12/12/2019, avis HCSP
  08/03/2021, rapport HCSP, rapport DITP 2022, dossier HCFEA 2020, rapport de
  la commission Enfants et écrans 04/2024 « À la recherche du temps perdu »,
  29 propositions). Ne pas l'importer ici (trop volumineux) : lire d'abord
  `docs/references/CITATIONS.md` (carte claim → section + page PDF) pour
  identifier le bon document, puis ouvrir le .md ou le PDF pour vérifier la
  citation exacte. Ne jamais inventer de chiffre ou de recommandation.
- Le jeu vidéo est un outil de médiation légitime — jamais un problème à résoudre.
- « intervenant culturel » toujours au singulier (un seul, à Lékoklaya) — jamais
  « intervenants culturels ». Outillé par `ds-lint` R12 (`phrase-interdite`), qui
  balaie tout `.astro`/`.ts` sous `src/`, plaquette comprise
  (`src/pages/plaquette.astro`) : tout pluriel casse le build. Ajouter un fait à garder dans
  `FORBIDDEN_PHRASES` (`scripts/ds-lint.mjs`).

## Garde-fous non négociables (visuel)

- Coral (`#FF5E3A`) ≤ 5 % des pixels par page ou image.
- Jamais de texte blanc sur fond coral.
- Pas de gradients. Un seul CTA primaire par section.

## Commandes (npm)

Les scripts sont listés dans `package.json` ; ce qui ne s'en déduit pas :

- `npm run check` — lint → typecheck → build (gates) → a11y : la commande à
  faire passer avant de livrer, rejouée telle quelle par la CI.
- `npm run build` enchaîne des gates : prebuild gen:tokens → design → ds-lint,
  postbuild check-links → schema-check → seo-lint (h1 unique, titles et
  descriptions uniques, alt présents, noindex hors sitemap) → seo-check. Un
  build qui casse sur une gate = règle brand, contenu, lien ou SEO violé, pas
  un bug à contourner.
- `npm run seo:accept` — recapture la baseline après un écart SEO voulu (voir
  ci-dessous).
- `npm run release -- <n>` — CI de la PR, fusion en squash, déploiement, vérif prod,
  puis soumission IndexNow (Bing, Yandex, Naver, Seznam ; pas Google) des pages
  dont le lastmod porte le commit de fusion — non bloquante. La clé est publique
  (`public/<clé>.txt`, exigée par check-links) ; `npm run indexnow -- --all`
  resoumet les 7 URLs après un changement de composant partagé.
- `npm run plaquette` — build puis export de la page `/plaquette/`
  (`src/pages/plaquette.astro`, layout `PlaquetteLayout`) en PDF A4 vers
  `public/files/plaquette-pxlc.pdf` avec le Chromium Playwright. Le PDF est un
  binaire committé que la CI ne régénère pas : toute modification de la page se
  relance et se committe avec lui. Garde-fous du script : 6 pages exactement,
  aucun texte de la couleur de son fond.
- `npm run gen:communes` — régénère `src/data/communes-971.json` (contours des
  communes depuis geo.api.gouv.fr, rendus au build en SVG par `CommuneMap`) —
  manuel, réseau requis.
- Liens externes : workflow hebdomadaire `.github/workflows/links.yml`
  (lychee sur le build, config `lychee.toml`), non bloquant, rapport dans le
  résumé du run. Les liens internes restent gardés par check-links.

## Non-régression SEO (mécanisme central)

`docs/seo-baseline/` contient la référence de la surface SEO (canonical,
title, metas, og/twitter, JSON-LD trié, sitemap, robots.txt). À chaque build,
`seo-check` (postbuild) compare `dist/` à cette baseline et **fait échouer le
build** sur tout écart, avec le chemin et les valeurs avant/après.

- Écart voulu : `npm run seo:accept` recapture la baseline ; committer
  `docs/seo-baseline` avec le changement qui l'a motivé et déclarer le delta
  dans la PR. Pas de commit « recapture » séparé.
- Écart non voulu : c'est une régression, corriger le code.

La capture ignore ce qui n'est pas du SEO (meta CSP, `dateModified`,
`lastmod`) : la baseline ne bouge que quand le SEO bouge et ne dérive pas à
la fusion en squash. Jamais de comparaison `-eq` PowerShell pour vérifier du
texte : elle assimile l'espace insécable à l'espace simple.

## Stack & architecture — pièges à connaître

- Zéro île hydratée : toute l'interactivité est en `<script>` vanilla dans
  les composants `.astro`. GitHub Pages n'a pas de runtime : aucune API route.
- CSP émise par Astro (`security.csp`) : il hache ses propres scripts et
  styles ; `BaseLayout` déclare en plus le hash du JSON-LD de la page via
  `Astro.csp.insertScriptHash`, la config celui du script anti-flash
  (`src/lib/theme-script.ts`, seul `is:inline` du site avec la 404). Un
  `fetch` runtime vers un autre domaine serait bloqué (`connect-src 'self'`).
- Trailing slash partout : canonical = forme avec slash, GitHub Pages
  301-redirige la forme sans slash.
- `lastmod` du sitemap = date du dernier commit touchant la page
  (`scripts/sitemap-lastmod.mjs`) — d'où le `fetch-depth: 0` du workflow.
- `public/robots.txt` est statique (3 groupes : tous, bots d'entraînement IA
  refusés, bots de recherche IA autorisés) — le maintenir à la main.
- Les originaux de `public/img/photos/` restent en place, référencés par le
  JSON-LD et la fiche Google Business Profile — ne pas les supprimer.
- `src/config/identity.ts` est la source unique du NAP (JSON-LD, mentions
  légales, contact) — toute divergence casse la cohérence avec la fiche Google.

## Workflow attendu

- Toute nouvelle page doit définir : `const seo = { title ≤ 53, description
  ≤ 120, … }` passé à BaseLayout, un `schemaGraph` (via `pageGraph`), un seul
  CTA primaire.
- Avant de considérer une tâche terminée, exécuter `npm run check` (lint,
  typecheck, build avec toutes ses gates, a11y).
- Sortie d'une PR : `npm run release -- <n>` (CI, fusion en squash, attente du
  déploiement, vérification de la prod).
- Petits commits ciblés ; messages en français, sans emoji.
- En cas de doute sur le ton, le positionnement ou la cible d'un texte :
  proposer, ne pas publier — Andy valide tout le copy final.
