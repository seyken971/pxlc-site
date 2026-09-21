---
name: PXLC Design System
colors:
  palette:
    pxlc-teal-deep: "#036E73"
    pxlc-teal-mid: "#01A09D"
    pxlc-cyan: "#00D2C8"
    pxlc-coral: "#FF5E3A"
    pxlc-coral-deep: "#E8492A"
    pxlc-coral-deep-dark: "#FF7A5C"
    pxlc-teal-soft: "#DCEFED"
    pxlc-teal-soft-dark: "#0F3D48"
    pxlc-coral-soft: "#FFE3DA"
    pxlc-coral-soft-dark: "#3A1D17"
    pxlc-bg-light: "#EAF6F4"
    pxlc-bg-dark: "#082B36"
    pxlc-bg-dark-soft: "#0C3340"
    pxlc-bg-dark-deep: "#06212A"
    pxlc-ivory: "#F4F1EA"
    pxlc-ivory-soft: "#EBE6DA"
    pxlc-text-ink: "#082B36"
    pxlc-text-on-light: "#2C4751"
    pxlc-text-secondary: "#5A6B70"
    pxlc-text-on-dark-soft: "#A9C8D0"
    pxlc-text-quiet-dark: "#8A9DA3"
    pxlc-border: "#C4D1D2"
    pxlc-border-soft: "#D9D2BF"
    pxlc-border-dark: "#103847"
    pxlc-border-dark-2: "#1F4A59"
    pxlc-white: "#FFFFFF"
    pxlc-pattern-warm: "#D6CEBD"
    pxlc-pattern-warm-deep: "#CDC4B0"
  semantic:
    surface:
      light: "var(--pxlc-ivory)"
      dark: "var(--pxlc-bg-dark)"
    surface-raised:
      light: "var(--pxlc-white)"
      dark: "var(--pxlc-bg-dark-soft)"
    surface-soft:
      light: "var(--pxlc-bg-light)"
      dark: "var(--pxlc-bg-dark-deep)"
    line:
      light: "var(--pxlc-border-soft)"
      dark: "var(--pxlc-border-dark-2)"
    ink:
      light: "var(--pxlc-text-ink)"
      dark: "var(--pxlc-ivory)"
    ink-muted:
      light: "var(--pxlc-text-on-light)"
      dark: "var(--pxlc-text-on-dark-soft)"
    ink-quiet:
      light: "var(--pxlc-text-secondary)"
      dark: "var(--pxlc-text-quiet-dark)"
    parent:
      light: "var(--pxlc-teal-deep)"
      dark: "var(--pxlc-cyan)"
    parent-mid: "var(--pxlc-teal-mid)"
    parent-soft:
      light: "var(--pxlc-teal-soft)"
      dark: "var(--pxlc-teal-soft-dark)"
    on-parent:
      light: "var(--pxlc-white)"
      dark: "var(--pxlc-bg-dark)"
    child: "var(--pxlc-coral)"
    child-deep:
      light: "var(--pxlc-coral-deep)"
      dark: "var(--pxlc-coral-deep-dark)"
    child-soft:
      light: "var(--pxlc-coral-soft)"
      dark: "var(--pxlc-coral-soft-dark)"
    on-child: "var(--pxlc-text-ink)"
    link: "var(--parent)"
    bg-glass:
      light: "rgba(244, 241, 234, 0.92)"
      dark: "rgba(8, 43, 54, 0.92)"
    dot-grid:
      light: "rgba(8, 43, 54, 0.09)"
      dark: "rgba(255, 255, 255, 0.06)"
    hover-on-dark: "rgba(255, 255, 255, 0.06)"
    map-land:
      light: "var(--pxlc-white)"
      dark: "var(--pxlc-bg-dark-soft)"
    map-stroke:
      light: "var(--pxlc-text-secondary)"
      dark: "var(--pxlc-text-quiet-dark)"
    map-zone-stroke:
      light: "var(--pxlc-teal-deep)"
      dark: "var(--pxlc-cyan)"
    rule-accent: "rgba(1, 160, 157, 0.25)"
    teal-deep: "var(--pxlc-teal-deep)"
    teal-mid: "var(--pxlc-teal-mid)"
    cyan: "var(--pxlc-cyan)"
    shadow-card:
      light: "0 8px 24px -12px rgba(8,43,54,.18)"
      dark: "0 8px 24px -12px rgba(0,0,0,.45)"
    shadow-header:
      light: "0 2px 14px -6px rgba(8,43,54,.14)"
      dark: "0 2px 14px -6px rgba(0,0,0,.45)"
    focus-ring: "0 0 0 2px var(--surface), 0 0 0 4px var(--parent)"
    focus-ring-on-dark: "0 0 0 2px var(--pxlc-bg-dark), 0 0 0 4px var(--pxlc-cyan)"
typography:
  font-display: "\"Plus Jakarta Sans\", \"Plus Jakarta Sans Fallback\", system-ui, -apple-system, \"Segoe UI\", sans-serif"
  font-body: "\"Lora\", \"Lora Fallback\", Georgia, \"Times New Roman\", serif"
  font-label: "\"Plus Jakarta Sans\", \"Plus Jakarta Sans Fallback\", system-ui, sans-serif"
  font-code: "ui-monospace, \"SFMono-Regular\", Menlo, \"Courier New\", monospace"
spacing:
  base: "8px"
  space-1: "4px"
  space-1-5: "6px"
  space-2: "8px"
  space-2-5: "12px"
  space-3: "16px"
  space-4: "24px"
  space-5: "32px"
  space-6: "48px"
  space-7: "64px"
  space-8: "80px"
  space-9: "96px"
radius:
  radius-xs: "4px"
  radius-sm: "6px"
  radius-md: "8px"
  radius-lg: "14px"
  radius-xl: "24px"
  radius-pill: "999px"
motion:
  ease-step: "cubic-bezier(.6, 0, .2, 1)"
  dur-fast: "120ms"
  dur-base: "200ms"
  dur-slow: "320ms"
layout:
  container-max: "1200px"
  container-pad: "clamp(20px, 4vw, 56px)"
  z-header: "50"
  z-menu: "100"
  z-progress: "200"
  z-skip: "1000"
---

# PXLC — Design System

> Généré automatiquement par `scripts/export-design.mjs`.
> Source : `src/styles/tokens.css` + `styles.css`.
> Relancer `npm run design` après toute modification des sources CSS.

## Palette

| Token | Hex / valeur |
| --- | --- |
| `--pxlc-teal-deep` | `#036E73` |
| `--pxlc-teal-mid` | `#01A09D` |
| `--pxlc-cyan` | `#00D2C8` |
| `--pxlc-coral` | `#FF5E3A` |
| `--pxlc-coral-deep` | `#E8492A` |
| `--pxlc-coral-deep-dark` | `#FF7A5C` |
| `--pxlc-teal-soft` | `#DCEFED` |
| `--pxlc-teal-soft-dark` | `#0F3D48` |
| `--pxlc-coral-soft` | `#FFE3DA` |
| `--pxlc-coral-soft-dark` | `#3A1D17` |
| `--pxlc-bg-light` | `#EAF6F4` |
| `--pxlc-bg-dark` | `#082B36` |
| `--pxlc-bg-dark-soft` | `#0C3340` |
| `--pxlc-bg-dark-deep` | `#06212A` |
| `--pxlc-ivory` | `#F4F1EA` |
| `--pxlc-ivory-soft` | `#EBE6DA` |
| `--pxlc-text-ink` | `#082B36` |
| `--pxlc-text-on-light` | `#2C4751` |
| `--pxlc-text-secondary` | `#5A6B70` |
| `--pxlc-text-on-dark-soft` | `#A9C8D0` |
| `--pxlc-text-quiet-dark` | `#8A9DA3` |
| `--pxlc-border` | `#C4D1D2` |
| `--pxlc-border-soft` | `#D9D2BF` |
| `--pxlc-border-dark` | `#103847` |
| `--pxlc-border-dark-2` | `#1F4A59` |
| `--pxlc-white` | `#FFFFFF` |
| `--pxlc-pattern-warm` | `#D6CEBD` |
| `--pxlc-pattern-warm-deep` | `#CDC4B0` |

## Tokens sémantiques

Ces tokens résolvent vers la palette et basculent automatiquement en dark mode.

### Surfaces

| Token | Light | Dark |
| --- | --- | --- |
| `--surface` | `var(--pxlc-ivory)` | `var(--pxlc-bg-dark)` |
| `--surface-raised` | `var(--pxlc-white)` | `var(--pxlc-bg-dark-soft)` |
| `--surface-soft` | `var(--pxlc-bg-light)` | `var(--pxlc-bg-dark-deep)` |

### Texte

| Token | Light | Dark |
| --- | --- | --- |
| `--ink` | `var(--pxlc-text-ink)` | `var(--pxlc-ivory)` |
| `--ink-muted` | `var(--pxlc-text-on-light)` | `var(--pxlc-text-on-dark-soft)` |
| `--ink-quiet` | `var(--pxlc-text-secondary)` | `var(--pxlc-text-quiet-dark)` |
| `--link` | `var(--parent)` | — |

### Bordures

| Token | Light | Dark |
| --- | --- | --- |
| `--line` | `var(--pxlc-border-soft)` | `var(--pxlc-border-dark-2)` |
| `--rule-accent` | `rgba(1, 160, 157, 0.25)` | — |

### Parent (grand carré du logo)

| Token | Light | Dark |
| --- | --- | --- |
| `--parent` | `var(--pxlc-teal-deep)` | `var(--pxlc-cyan)` |
| `--parent-mid` | `var(--pxlc-teal-mid)` | — |
| `--parent-soft` | `var(--pxlc-teal-soft)` | `var(--pxlc-teal-soft-dark)` |
| `--on-parent` | `var(--pxlc-white)` | `var(--pxlc-bg-dark)` |

### Child (petit carré, accent unique)

| Token | Light | Dark |
| --- | --- | --- |
| `--child` | `var(--pxlc-coral)` | — |
| `--child-deep` | `var(--pxlc-coral-deep)` | `var(--pxlc-coral-deep-dark)` |
| `--child-soft` | `var(--pxlc-coral-soft)` | `var(--pxlc-coral-soft-dark)` |
| `--on-child` | `var(--pxlc-text-ink)` | — |

### Extensions du site

| Token | Light | Dark |
| --- | --- | --- |
| `--bg-glass` | `rgba(244, 241, 234, 0.92)` | `rgba(8, 43, 54, 0.92)` |
| `--dot-grid` | `rgba(8, 43, 54, 0.09)` | `rgba(255, 255, 255, 0.06)` |
| `--hover-on-dark` | `rgba(255, 255, 255, 0.06)` | — |
| `--map-land` | `var(--pxlc-white)` | `var(--pxlc-bg-dark-soft)` |
| `--map-stroke` | `var(--pxlc-text-secondary)` | `var(--pxlc-text-quiet-dark)` |
| `--map-zone-stroke` | `var(--pxlc-teal-deep)` | `var(--pxlc-cyan)` |
| `--teal-deep` | `var(--pxlc-teal-deep)` | — |
| `--teal-mid` | `var(--pxlc-teal-mid)` | — |
| `--cyan` | `var(--pxlc-cyan)` | — |

### Ombres & focus

| Token | Light | Dark |
| --- | --- | --- |
| `--shadow-card` | `0 8px 24px -12px rgba(8,43,54,.18)` | `0 8px 24px -12px rgba(0,0,0,.45)` |
| `--shadow-header` | `0 2px 14px -6px rgba(8,43,54,.14)` | `0 2px 14px -6px rgba(0,0,0,.45)` |
| `--focus-ring` | `0 0 0 2px var(--surface), 0 0 0 4px var(--parent)` | — |
| `--focus-ring-on-dark` | `0 0 0 2px var(--pxlc-bg-dark), 0 0 0 4px var(--pxlc-cyan)` | — |

## Typographie

| Token | Stack |
| --- | --- |
| `--font-display` | `"Plus Jakarta Sans", "Plus Jakarta Sans Fallback", system-ui, -apple-system, "Segoe UI", sans-serif` |
| `--font-body` | `"Lora", "Lora Fallback", Georgia, "Times New Roman", serif` |
| `--font-label` | `"Plus Jakarta Sans", "Plus Jakarta Sans Fallback", system-ui, sans-serif` |
| `--font-code` | `ui-monospace, "SFMono-Regular", Menlo, "Courier New", monospace` |

> Les tailles de titre utilisent `clamp()` défini localement dans chaque composant — pas de token `--fs-h1` global.

## Espacement

Rythme 8 px.

| Token | Valeur |
| --- | --- |
| `--space-1` | `4px` |
| `--space-1-5` | `6px` |
| `--space-2` | `8px` |
| `--space-2-5` | `12px` |
| `--space-3` | `16px` |
| `--space-4` | `24px` |
| `--space-5` | `32px` |
| `--space-6` | `48px` |
| `--space-7` | `64px` |
| `--space-8` | `80px` |
| `--space-9` | `96px` |

## Radius

| Token | Valeur |
| --- | --- |
| `--radius-xs` | `4px` |
| `--radius-sm` | `6px` |
| `--radius-md` | `8px` |
| `--radius-lg` | `14px` |
| `--radius-xl` | `24px` |
| `--radius-pill` | `999px` |

## Motion

| Token | Valeur |
| --- | --- |
| `--ease-step` | `cubic-bezier(.6, 0, .2, 1)` |
| `--dur-fast` | `120ms` |
| `--dur-base` | `200ms` |
| `--dur-slow` | `320ms` |

## Layout

| Token | Valeur |
| --- | --- |
| `--container-max` | `1200px` |
| `--container-pad` | `clamp(20px, 4vw, 56px)` |
| `--z-header` | `50` |
| `--z-menu` | `100` |
| `--z-progress` | `200` |
| `--z-skip` | `1000` |

## Composants CSS globaux

Classes issues de `styles.css`. Les styles scoped des composants Vue ne sont pas listés ici.

### Page root guards

- `.skip-link`

### Layout

- `.container`
- `.section`
- `.section--soft`
- `.section--page`
- `.section__head`
- `.grid`
- `.grid--2`
- `.grid--3`
- `.grid--asym`
- `.lead`
- `.eyebrow`
- `.kicker`
- `.coral-dot`

### Buttons

- `.btn`
- `.btn--lg`
- `.btn--block`
- `.btn--primary`
- `.btn--secondary`
- `.btn--ghost`
- `.linkout`

### Form fields

- `.form-label`
- `.form-label__req`
- `.form-input`
- `.form-textarea`

### Header

- `.site-header`
- `.site-header__inner`
- `.site-header__right`
- `.site-header__cta`
- `.lockup`
- `.lockup__mark`
- `.lockup__name`
- `.site-nav`
- `.site-nav__link`
- `.theme-toggle`
- `.burger`

### Mobile menu (dark, slides from right)

- `.mobile-menu`
- `.mobile-menu__watermark`
- `.mobile-menu__strip`
- `.mobile-menu__head`
- `.mobile-menu__close`
- `.mobile-menu__nav`
- `.mobile-menu__link`
- `.mobile-menu__arrow`
- `.mobile-menu__bottom`
- `.mobile-menu__cta-btn`

### Hero

- `.hero`
- `.hero--soft`
- `.hero__strip`
- `.hero__bg-mark`
- `.hero__inner`
- `.hero__title`
- `.hero__lead`
- `.hero__actions`
- `.hero__hint`
- `.hero__media`
- `.hero__media-img`
- `.hero__pill`
- `.hero__pill-eyebrow`
- `.hero__pill-text`

### Motif Duo

- `.duo`
- `.duo__big`
- `.duo__small`
- `.duo--on-dark`

### Cards

- `.card`
- `.card--method`
- `.card__duo`
- `.card__tag`

### Badges

- `.badge`
- `.badge--audience`
- `.badge--soft`
- `.badge--child`

### Footer

- `.site-footer`
- `.site-footer__mission`
- `.site-footer__mission-link`
- `.site-footer__inner`
- `.site-footer__col-title`
- `.site-footer__col-list`
- `.site-footer__col-link`
- `.site-footer__col-list--icons`
- `.site-footer__col-link--icon`
- `.site-footer__contact-icon`
- `.site-footer__social`
- `.site-footer__social-btn`
- `.site-footer__legal`
- `.site-footer__legal-links`

### Typographic utility classes (semantic aliases)

- `.pxlc-h1`
- `.pxlc-h2`
- `.pxlc-h3`
- `.pxlc-lead`
- `.pxlc-body`
- `.pxlc-body-sm`
- `.pxlc-eyebrow`
- `.pxlc-kicker`
- `.pxlc-tag`
- `.pxlc-mono`
- `.pxlc-coral-dot`

### Utility helpers

- `.mt-3`
- `.mt-4`
- `.mt-5`
- `.mt-6`
- `.prose`
- `.eyebrow--lg`

### Long-form prose (mentions légales, etc.)

- `.prose`

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
- Deux mots minimum par nom (style guide Vue — évite les collisions avec de futurs éléments HTML natifs)

### Visuel

- Coral max **5 %** des pixels par page ou image
- Un seul CTA primaire par section
- Jamais de texte blanc sur fond coral — utiliser `--on-child`
- Pas de gradients, pas d'emoji en iconographie
- **Logo** (design system PXLC 2026) : grand carré parent (`--parent`) + petit carré enfant (`--child`) en diagonale sur une grille 3×3 — ne jamais inverser les rôles, recolorer l'enfant, déformer ni pivoter (seul le filigrane, −8°, 8 % en clair / 18 % en sombre)
- **Motif Duo** (`PxlcDuo`) : paires grand/petit, seul le dernier petit carré est corail — une fois par écran au plus ; la petite marque (`PxlcMark` 20 px) coiffe les cartes d'étape

### OG Images

- Générateur : endpoints `src/pages/og/*.png.ts` (satori + resvg via `src/lib/og-templates.ts`) — disponibles aussi en dev
- Carte de marque `/og/site.png` (logo + tagline), identique sur toutes les pages
- Couleurs depuis `src/lib/brand-colors.ts`, polices TTF vendorées dans `src/assets/og-fonts/`
