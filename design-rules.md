# PXLC — Règles brand

> Généré automatiquement par `scripts/export-design.mjs` — extrait de
> `design.md` (règles seules), importé par `CLAUDE.md`. Tokens, palette et
> classes CSS : voir `design.md` ou `src/styles/tokens.css`.

## Règles brand

### Copy

- Voix 1ère personne « je » — « je » porte les verbes d'action (j'anime, j'accompagne) ; « PXLC » est un nom de marque, jamais sujet d'un verbe d'action dans le copy page (exception : la mission verbatim)
- 3e personne (« Andy Zébus, créateur de PXLC, accompagne… ») réservée aux meta/OG, mentions légales et documents qui engagent l'entité (devis, conventions, factures)
- Pas d'emoji, nulle part
- **Vocabulaire interdit** : addiction, désintoxication, détox numérique, coach, expert, innovant, révolutionnaire — fondement : avis HCSP du 08/03/2021, la MILDECA préfère « usage problématique des écrans » ; utiliser ce terme
- **Termes naked** (sans guillemets ni traduction) : HCSP, SESSAD, TCND, TND, hyperfocus
- Espaces insécables avant `!`, `?`, `:`, `;`, `»` et entre nombre + unité (`48 h`, `20 min`, `100 €`)
- Chiffres en numéraux sauf en début de phrase
- `Parent-Écran-Enfant` au singulier, avec majuscules et traits d'union — jamais « Parents-Écran-Enfant »
- Ne jamais écrire « fondateur » — écrire « créateur de PXLC »
- Nommer les clients : terme générique « les structures » — le mot que les acheteurs publics emploient pour eux-mêmes, écoles et centres socioculturels compris (consultation CCAS de Pointe-à-Pitre, 2026). « les lieux qui accueillent des familles » sert de périphrase de variation, jamais de terme canonique : « lieu d'accueil » renvoie au LAEP. En adresse directe, nommer le lieu (« votre médiathèque ») ou « votre structure »
- Mission en une phrase : « PXLC accompagne les familles autour des écrans. »
- Cadre réglementaire : toujours citer HCSP 2019-2020 · HAS 2020 ensemble
- Toute affirmation santé/usage des écrans doit être sourcée depuis docs/references/ (document + section) — ne jamais inventer un chiffre ou une recommandation

### Positionnement B2B

- **Principe** : intervenir dans les lieux qui accueillent déjà des familles — le lieu apporte le public, j'apporte l'atelier et le cadre
- **Clients** = les structures qui accueillent déjà des familles : médiathèques et collectivités, centres sociaux et espaces de vie sociale, écoles et centres socioculturels, CCAS et dispositifs de réussite éducative, LAEP, SESSAD, IME, CMPP, CAMSP, dispositifs CLAS — les familles sont bénéficiaires, pas clients directs
- **Posture** : partenaire institutionnel — jamais coach, expert ou gadget
- **Jeu vidéo** = outil de médiation légitime — jamais un problème à résoudre
- **Différenciateur** : seul pont entre 3 mondes — culture joueur / cadre du soin / langage institutionnel

### Les 3 casquettes (ancres de légitimité)

1. **Organisateur esport** — Plus de 6 ans sur la scène esport guadeloupéenne, Destreland Gaming Cup. Connaissance de la communauté joueurs de l'intérieur.
2. **Médiateur formé** — Formateur Simplon Outre-Mer 2021-2022. Travail dans le cadre HCSP · HAS.
3. **Conseil institutionnel** — Affaires européennes et numérique THD, Région Guadeloupe. Parle le langage des projets de service.

### Nommage des composants

- **`Pxlc*`** — primitives de marque réutilisables partout : `PxlcDuo`, `PxlcInput`, `PxlcLinkout`, `PxlcLockup`, `PxlcMark`, `PxlcMarkSeparator`
- **`Site*`** — chrome du site (présent sur toutes les pages) : `SiteBreadcrumb`, `SiteFooter`, `SiteHead`, `SiteHeader`, `SiteMobileMenu`
- **Sans préfixe** — sections de page, blocs de contenu et utilitaires autonomes : `CitationBlock`, `CommuneMap`, `HeroSection`, `MethodGrid`, `PartnerStrip`, `PlaquettePage`, `SessadCase`, `ThemeToggle`
- Deux mots minimum par nom (évite les collisions avec de futurs éléments HTML natifs)

### Visuel

- Coral max **5 %** des pixels par page ou image
- Un seul CTA primaire par section
- Jamais de texte blanc sur fond coral — utiliser `--on-child`
- Pas de gradients, pas d'emoji en iconographie
- **Typographie** : tailles de texte via l'échelle `--fs-title-1|2|3`, `--fs-lead`, `--fs-body`, `--fs-small`, `--fs-label`, `--fs-ui` (avec `--lh-*` / `--ls-*`) — un seul title-1 par page, jamais de taille de titre locale
- **Logo** (design system PXLC 2026) : grand carré parent (`--parent`) + petit carré enfant (`--child`) en diagonale sur une grille 3×3 — ne jamais inverser les rôles, recolorer l'enfant, déformer ni pivoter (seul le filigrane, −8°, 8 % en clair / 18 % en sombre)
- **Motif Duo** (`PxlcDuo`) : paires grand/petit, seul le dernier petit carré est corail — une fois par écran au plus ; la petite marque (`PxlcMark` 20 px) coiffe les cartes d'étape

### OG Images

- Générateur : endpoints `src/pages/og/*.png.ts` (satori + resvg via `src/lib/og-templates.ts`) — disponibles aussi en dev
- Carte de marque `/og/site.png` (logo + tagline), identique sur toutes les pages
- Couleurs depuis `src/lib/brand-colors.ts`, polices TTF vendorées dans `src/assets/og-fonts/`
