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
  fs-title-1: "clamp(36px, 5.4vw, 56px)"
  lh-title-1: "1.05"
  ls-title-1: "-0.03em"
  fs-title-2: "clamp(28px, 4.2vw, 40px)"
  lh-title-2: "1.1"
  ls-title-2: "-0.025em"
  fs-title-3: "24px"
  lh-title-3: "1.2"
  ls-title-3: "-0.01em"
  fs-lead: "clamp(17px, 2vw, 19px)"
  lh-lead: "1.55"
  fs-body: "16px"
  lh-body: "1.6"
  fs-body-sm: "15px"
  lh-body-sm: "1.6"
  fs-small: "14px"
  lh-small: "1.5"
  fs-label: "11px"
  ls-label: "0.18em"
  fs-ui: "15px"
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
  ease-out: "cubic-bezier(.23, 1, .32, 1)"
  ease-in-out: "cubic-bezier(.77, 0, .175, 1)"
  dur-fast: "150ms"
  dur-base: "200ms"
  dur-slow: "320ms"
  dur-enter: "480ms"
  dur-stagger: "60ms"
layout:
  container-max: "1200px"
  container-pad: "clamp(24px, 6vw, 64px)"
  z-header: "50"
  z-menu: "100"
  z-skip: "1000"
---

# PXLC — Design System

> Généré automatiquement par `scripts/export-design.mjs`.
> Source : `src/styles/tokens.css` + `styles.css` + `src/components/`.
> Relancer `npm run design` après toute modification des sources CSS ou des composants.

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

### Échelle typographique (design system PXLC 2026)

| Token | Valeur |
| --- | --- |
| `--fs-title-1` | `clamp(36px, 5.4vw, 56px)` |
| `--lh-title-1` | `1.05` |
| `--ls-title-1` | `-0.03em` |
| `--fs-title-2` | `clamp(28px, 4.2vw, 40px)` |
| `--lh-title-2` | `1.1` |
| `--ls-title-2` | `-0.025em` |
| `--fs-title-3` | `24px` |
| `--lh-title-3` | `1.2` |
| `--ls-title-3` | `-0.01em` |
| `--fs-lead` | `clamp(17px, 2vw, 19px)` |
| `--lh-lead` | `1.55` |
| `--fs-body` | `16px` |
| `--lh-body` | `1.6` |
| `--fs-body-sm` | `15px` |
| `--lh-body-sm` | `1.6` |
| `--fs-small` | `14px` |
| `--lh-small` | `1.5` |
| `--fs-label` | `11px` |
| `--ls-label` | `0.18em` |
| `--fs-ui` | `15px` |

> Taille `--fs-*`, interligne `--lh-*`, interlettrage `--ls-*`. Graisse : 700 pour title-1/2, 600 pour title-3, label et ui. Les chiffres d'affichage décoratifs (repères, frise, numéros d'étape) restent hors échelle.

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
| `--ease-out` | `cubic-bezier(.23, 1, .32, 1)` |
| `--ease-in-out` | `cubic-bezier(.77, 0, .175, 1)` |
| `--dur-fast` | `150ms` |
| `--dur-base` | `200ms` |
| `--dur-slow` | `320ms` |
| `--dur-enter` | `480ms` |
| `--dur-stagger` | `60ms` |

## Layout

| Token | Valeur |
| --- | --- |
| `--container-max` | `1200px` |
| `--container-pad` | `clamp(24px, 6vw, 64px)` |
| `--z-header` | `50` |
| `--z-menu` | `100` |
| `--z-skip` | `1000` |

## Composants CSS globaux

Classes issues de `styles.css`. Les variantes scoped des composants sont listées dans « Composants ».

### Scroll reveal

- `.js`

### Entrée au chargement

- `.enter`

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
- `.mobile-menu__head`
- `.mobile-menu__close`
- `.mobile-menu__nav`
- `.mobile-menu__link`
- `.mobile-menu__arrow`
- `.mobile-menu__bottom`
- `.mobile-menu__cta-btn`

### Hero

- `.hero`
- `.hero__inner`
- `.hero__title`
- `.hero__lead`
- `.hero__actions`
- `.hero__hint`
- `.hero__alt`
- `.hero__media`
- `.hero__media-img`
- `.hero__media-corner`
- `.hero__pill`
- `.hero__pill-eyebrow`
- `.hero__pill-text`

### Cards

- `.card`
- `.card--method`
- `.card__mark`
- `.card__tag`

### Badges

- `.badge`
- `.badge--audience`
- `.badge--soft`
- `.badge--child`

### Faits

- `.facts`
- `.facts--rows`

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

### Long-form prose (mentions légales, etc.)

- `.prose`

## Composants

Généré depuis `src/components/` : description et tags `@usage` / `@a11y` du bloc JSDoc de tête, props depuis `interface Props`, variantes et états depuis le `<style>` du composant.

### Primitives de marque (`Pxlc*`)

#### `PxlcInput`

Champ de formulaire avec son libellé : input, ou textarea dès que rows est fourni.

| Prop | Type | Défaut | Rôle |
| --- | --- | --- | --- |
| `id` * | `string` | — | Identifiant du champ, relié au libellé. |
| `label` * | `string` | — | Libellé visible. |
| `type` | `HTMLAttributes<'input'>['type']` | — | Type d'input (text par défaut) ; ignoré en textarea. |
| `placeholder` | `string` | — | Exemple de saisie, jamais un substitut du libellé. |
| `rows` | `number` | — | Nombre de lignes : rend une textarea. |
| `required` | `boolean` | — | Champ obligatoire (required natif, astérisque visuel). |
| `autocomplete` | `string` | — | Jeton autocomplete (name, email…) ; ignoré en textarea. |

- **Usage** : Formulaire de la page contact.
- **Accessibilité** : Libellé visible relié par for/id ; champ requis marqué par l'attribut natif required, l'astérisque visuel restant en aria-hidden.

#### `PxlcLinkout`

Lien texte de sortie de section, stylé .linkout, libellé en slot.

| Prop | Type | Défaut | Rôle |
| --- | --- | --- | --- |
| `href` * | `string` | — | Destination du lien. |

- **Usage** : Fin de bloc de contenu (étude de cas SESSAD).
- **Accessibilité** : Lien natif ; le libellé du slot doit nommer la destination seul.

#### `PxlcLockup`

Logo et nom « PXLC » côte à côte, en lien vers l'accueil. Le petit carré corail du logo tient lieu de point : pas de point typographique.

| Prop | Type | Défaut | Rôle |
| --- | --- | --- | --- |
| `size` | `'sm' \| 'md' \| 'lg'` | `'sm'` | Gabarit : logo 36, 40 ou 56 px ; nom 22 ou 34 px. |
| `href` | `string` | `'/'` | Destination du lien. |
| `onDark` | `boolean` | `false` | Surface toujours sombre (footer, menu mobile) : parent en cyan. |
| `class` | `string` | — | Classes ajoutées au lien (placement dans le parent). |

- **Usage** : En-tête, pied de page, menu mobile, page 404.
- **Accessibilité** : Un seul lien nommé « PXLC — accueil » ; le logo interne est decorative pour ne pas annoncer la marque deux fois.

#### `PxlcMark`

Le logo PXLC (design system « PXLC 2026 ») : sur une grille 3×3, un grand carré (le parent, 2×2 cellules) et un petit carré (l'enfant, la cellule en bas à droite), face à face en diagonale. Le parent suit le thème (--parent : teal en clair, cyan en sombre) ; l'enfant est toujours --child (corail). Ne jamais inverser les rôles, recolorer l'enfant, déformer ni pivoter (seul le filigrane incliné à −8° l'est).

| Prop | Type | Défaut | Rôle |
| --- | --- | --- | --- |
| `size` | `number` | `36` | Côté du carré, en px. |
| `decorative` | `boolean` | `false` | Masque le logo aux technologies d'assistance (aria-hidden). |
| `onDark` | `boolean` | `false` | Force le parent en cyan sur une surface toujours sombre (footer, menu mobile). |
| `mono` | `boolean` | `false` | Version une couleur, en encre. |
| `class` | `string` | — | Classes ajoutées au SVG (placement dans le parent). |

- **Usage** : Seul dans les en-têtes et le filigrane ; en 20 px, coiffe les cartes d'étape ; dans le lockup, toujours decorative (le lien porte le nom).
- **Accessibilité** : role="img" et aria-label « Logo PXLC » par défaut ; decorative le passe en aria-hidden quand un texte voisin nomme déjà la marque.

#### `PxlcMarkSeparator`

Séparateur horizontal : deux filets encadrant la petite marque 18 px.

Aucune prop.

- **Usage** : Entre deux sections de contenu (accueil, pages légales).
- **Accessibilité** : Décoratif : bloc entier en aria-hidden.

### Chrome du site (`Site*`)

#### `SiteBreadcrumb`

Fil d'Ariane dérivé de l'URL et de la navigation.

| Prop | Type | Défaut | Rôle |
| --- | --- | --- | --- |
| `currentLabel` | `string` | — | Libellé du segment final quand il n'est pas dans la nav (ex. « Plaquette »). |

- **États** : `:hover`
- **Usage** : Pages intérieures (projets, à propos, contact) ; le JSON-LD BreadcrumbList vient de la même source.
- **Accessibilité** : Nav nommée « Fil d'Ariane », liste ordonnée, dernier segment en aria-current="page".

#### `SiteFooter`

Pied de page : lockup, mission, liens de contact, plan du site, mentions légales et accessibilité.

Aucune prop.

- **Usage** : Toutes les pages, via BaseLayout.
- **Accessibilité** : Liens-icônes nommés par aria-label, icônes en aria-hidden ; liens externes et PDF annoncés dans leur libellé accessible.

#### `SiteHead`

Surface SEO d'une page dans le head : title, canonical, metas, OG et Twitter, JSON-LD haché pour la CSP.

| Prop | Type | Défaut | Rôle |
| --- | --- | --- | --- |
| `title` * | `string` | — | Titre de page sans suffixe — « %s · PXLC » appliqué ici. ≤ 53 caractères. |
| `description` * | `string` | — | Meta description. ≤ 120 caractères. |
| `ogDescription` | `string` | `description` | og:description si différente de description (ex : accueil). |
| `ogTitle` | `string` | `fullTitle` | og:title si différent du titre complet (ex. sans le suffixe « · PXLC », og:site_name portant déjà la marque). |
| `ogType` | `'website' \| 'article'` | `'website'` | og:type de la page. |
| `robots` | `string` | `'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'` | Directive meta robots (noindex pour les pages hors sitemap). |
| `ogImage` | `string` | ``${SITE.url}/og/site.png?v=1200x675`` | URL absolue de l'image OG (1200×675, 16:9). |
| `ogImageAlt` | `string` | `'Logo PXLC — Médiation numérique · Guadeloupe'` | Texte alternatif de l'image OG — la carte de marque par défaut. |
| `schemaGraph` | `object[]` | — | Graphe schema.org complet de la page (nœuds du @graph). |
| `colorScheme` | `'light dark' \| 'light'` | `'light dark'` | `light dark` par défaut ; `light` pour une page au thème épinglé. |

- **Usage** : Une fois par page, via BaseLayout ou PlaquetteLayout ; tout ce qu'il émet est verrouillé par la baseline SEO.
- **Accessibilité** : Pose color-scheme (thème natif des contrôles) et ogImageAlt ; rien de visible dans la page.

#### `SiteHeader`

En-tête du site : lockup, navigation principale, bascule de thème, CTA « Prendre RDV » (Vyte) et burger qui ouvre SiteMobileMenu.

Aucune prop.

- **Usage** : Toutes les pages, via BaseLayout.
- **Accessibilité** : Nav nommée « Navigation principale », page courante en aria-current="page" ; CTA externe annoncé « nouvel onglet » ; burger en aria-expanded / aria-controls="mobile-menu".

#### `SiteMobileMenu`

Menu mobile plein écran : navigation, CTA de rendez-vous, liens vers la plaquette.

Aucune prop.

- **États** : `:hover`
- **Usage** : Toutes les pages, via BaseLayout ; ouvert par le burger de SiteHeader.
- **Accessibilité** : Dialog modal nommé, inert tant qu'il est fermé ; focus piégé à l'ouverture, Échap ferme et rend le focus au burger ; page courante en aria-current="page".

### Sections et blocs

#### `CitationBlock`

Citation mise en exergue : source (facultative), extrait entre guillemets français, attribution.

| Prop | Type | Défaut | Rôle |
| --- | --- | --- | --- |
| `source` | `string` | — | Provenance, affichée au-dessus de l'extrait ; à omettre quand elle redirait l'attribution. |
| `quote` * | `string` | — | Extrait exact, sans guillemets (ajoutés par le composant). |
| `attribution` * | `string` | — | Auteur ou cadre de la citation. |
| `soft` | `boolean` | `true` | Fond doux (.section--soft). |

- **Usage** : Une citation par page au plus (parole d'Andy, devise de projet) ; citée telle quelle, jamais reformulée.
- **Accessibilité** : Section nommée « Citation » ; figure, blockquote et figcaption ; guillemets décoratifs en aria-hidden.

#### `CommuneMap`

Carte des communes de Guadeloupe, rendue en SVG inline au build depuis src/data/communes-971.json (généré par scripts/build-communes.mjs — contours réels, jamais un tracé à la main). Les communes de `zone` sont remplies et numérotées ; les noms ne sont pas écrits sur la carte (communes mitoyennes, les libellés se chevauchent) mais dans la légende, reliés par les numéros.

| Prop | Type | Défaut | Rôle |
| --- | --- | --- | --- |
| `zone` * | `string[]` | — | Communes surlignées, dans l'ordre des numéros de la légende. |
| `label` * | `string` | — | Nom accessible de la carte (role="img"). |

- **Variantes** : `.commune-map__commune--zone`
- **Usage** : Page contact, zone d'intervention.
- **Accessibilité** : SVG en role="img" nommé par label ; tracés et numéros en aria-hidden ; la légende en liste ordonnée porte les noms.

#### `HeroSection`

Hero de page, gabarit unique de toutes les pages : fil d'Ariane (facultatif), eyebrow, titre h1, chapô, zone d'action (CTA ou contenu libre), photo facultative dans un cadre décalé. Sans photo, le texte garde la même largeur de colonne.

| Prop | Type | Défaut | Rôle |
| --- | --- | --- | --- |
| `breadcrumb` | `boolean` | `false` | Affiche le fil d'Ariane au-dessus de l'eyebrow (pages intérieures). |
| `breadcrumbLabel` | `string` | — | Libellé du dernier segment du fil d'Ariane quand la page n'est pas dans la nav. |
| `eyebrow` | `string` | `'PXLC · Guadeloupe'` | Surtitre au-dessus du h1. |
| `title` * | `string` | — | Titre de la page, rendu en h1. |
| `titleDot` | `boolean` | `false` | Ajoute une marque finale corail après le titre. |
| `titleMark` | `string` | `'.'` | Marque finale du titre (par défaut un point ; ex. « ? » précédé d'une insécable). |
| `lead` | `string` | `''` | Chapô sous le titre (texte simple ; slot « lead » pour du balisage). |
| `ctaPrimary` | `Cta \| null` | `null` | Le CTA primaire de la section (un seul). |
| `ctaSecondary` | `Cta \| null` | `null` | CTA secondaire, en bouton ghost. |
| `ctaSecondaryAlt` | `AltLink \| null` | `null` | Lien texte discret à côté du CTA secondaire. |
| `hint` | `string \| null` | `null` | Mention courte sous les CTA. |
| `photo` | `ImageMetadata \| null` | `null` | Photo importée depuis src/assets (astro:assets génère les variantes webp). |
| `photoAlt` | `string` | `''` | Texte alternatif de la photo. |
| `pill` | `Pill \| null` | `null` | Pastille posée sur la photo : surtitre et texte. |

- **Usage** : Une fois par page, en tête ; porte l'unique h1. Le slot par défaut remplace ou complète les CTA (ex. réassurance du contact) ; le slot « lead » remplace le chapô texte quand il faut du balisage.
- **Accessibilité** : Section reliée à son h1 ; CTA externes suffixés « (nouvel onglet) » dans leur aria-label ; marque finale du titre et cadre en aria-hidden ; photo décrite par photoAlt.

#### `MethodGrid`

Section « Ma méthode en trois temps » : une carte par étape, coiffée de la petite marque ; la première étape est mise en vedette (plus grande, fond parent-soft), les suivantes s'empilent à côté.

| Prop | Type | Défaut | Rôle |
| --- | --- | --- | --- |
| `steps` * | `MethodStep[]` | — | Étapes dans l'ordre : numéro, titre, texte, étiquette facultative. |
| `more` | `MoreLink \| null` | `null` | Lien facultatif sous la grille (ex. le déroulé appliqué sur /projets/). |

- **Variantes** : `.card--featured`, `.card--method`
- **Usage** : Accueil. Le lien « more » renvoie au déroulé concret d'un projet, qui reprend les mêmes trois temps.
- **Accessibilité** : Section reliée à son h2 (aria-labelledby) ; une carte = un article titré en h3 ; marque et numéro fantôme décoratifs.

#### `PlaquettePage`

Feuille A4 de la plaquette : en-tête de navigation, contenu en slot, pied avec édition et domaine ; variante couverture sur fond sombre.

| Prop | Type | Défaut | Rôle |
| --- | --- | --- | --- |
| `num` * | `string` | — | Numéro de feuille, deux chiffres (« 02 »). |
| `total` * | `string` | — | Nombre total de feuilles (« 06 »). |
| `label` | `string` | — | Libellé de navigation en tête de feuille (« 01 · La mission »). |
| `cover` | `boolean` | `false` | Couverture : fond sombre, sans en-tête ni pied. |
| `version` * | `string` | — | Édition, affichée dans le pied (« v6 »). |
| `website` * | `string` | — | Domaine sans protocole, affiché dans le pied (« pxlc.fr »). |
| `screenLabel` * | `string` | — | Libellé écran de la feuille (aperçu, aria). |

- **Variantes** : `.pq-page--cover`
- **Usage** : Page /plaquette/, six feuilles exactement (garde-fou de npm run plaquette).
- **Accessibilité** : Chaque feuille est une section nommée par screenLabel.

#### `SessadCase`

Étude de cas SESSAD Lékoklaya (« Jouons Ensemble ! ») : photo, texte, faits du projet, devise et lien vers la page projets. Seul bloc de preuve de l'accueil : les faits viennent de src/config/projects.ts.

Aucune prop.

- **Usage** : Accueil. Faits de copy : voir les garde-fous de CLAUDE.md (intervenant culturel au singulier, « le psychologue »).
- **Accessibilité** : Section reliée à son h2 ; photo décrite ; faits en liste de définitions ; devise en figure/blockquote, guillemets décoratifs en aria-hidden.

#### `ThemeToggle`

Bascule clair / sombre. Suit le thème système tant que la personne n'a pas choisi ; son choix est gardé dans localStorage (pxlc-theme).

Aucune prop.

- **Usage** : Dans l'en-tête du site.
- **Accessibilité** : Bouton natif en aria-pressed ; aria-pressed et aria-label sont resynchronisés au chargement sur le thème réel ; icônes en aria-hidden.

> `*` = prop obligatoire.

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

- **`Pxlc*`** — primitives de marque réutilisables partout : `PxlcInput`, `PxlcLinkout`, `PxlcLockup`, `PxlcMark`, `PxlcMarkSeparator`
- **`Site*`** — chrome du site (présent sur toutes les pages) : `SiteBreadcrumb`, `SiteFooter`, `SiteHead`, `SiteHeader`, `SiteMobileMenu`
- **Sans préfixe** — sections de page, blocs de contenu et utilitaires autonomes : `CitationBlock`, `CommuneMap`, `HeroSection`, `MethodGrid`, `PlaquettePage`, `SessadCase`, `ThemeToggle`
- Deux mots minimum par nom (évite les collisions avec de futurs éléments HTML natifs)

### Visuel

- Coral max **5 %** des pixels par page ou image — exception : le logo lui-même (son petit carré en occupe environ 9 %), qu’on ne redimensionne jamais pour tenir la règle ; elle vaut pour tout le reste
- Un seul CTA primaire par section
- Jamais de texte blanc sur fond coral — utiliser `--on-child`
- Pas de gradients, pas d'emoji en iconographie
- **Typographie** : tailles de texte via l'échelle `--fs-title-1|2|3`, `--fs-lead`, `--fs-body`, `--fs-body-sm`, `--fs-small`, `--fs-label`, `--fs-ui` (avec `--lh-*` / `--ls-*`) — un seul title-1 par page, jamais de taille de titre locale
- **Logo** (design system PXLC 2026) : grand carré parent (`--parent`) + petit carré enfant (`--child`) en diagonale sur une grille 3×3 — ne jamais inverser les rôles, recolorer l'enfant, déformer ni pivoter (seul le filigrane, −8°, 8 % en clair / 18 % en sombre)
- **Petite marque** (`PxlcMark` 20 px) : coiffe les cartes d'étape ; le motif Duo a été retiré du design system

### OG Images

- Générateur : endpoints `src/pages/og/*.png.ts` (satori + resvg via `src/lib/og-templates.ts`) — disponibles aussi en dev
- Carte de marque `/og/site.png` (logo + tagline), identique sur toutes les pages
- Couleurs depuis `src/lib/brand-colors.ts`, polices TTF vendorées dans `src/assets/og-fonts/`
