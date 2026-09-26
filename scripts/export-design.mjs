#!/usr/bin/env node
/**
 * Génère design.md (référence complète : tokens, palette, classes,
 * composants, règles) et design-rules.md (règles brand seules, importé par
 * CLAUDE.md) depuis src/styles/tokens.css + styles.css et les contrats
 * JSDoc de src/components/ (voir component-docs.mjs).
 *
 * Usage :
 *   node scripts/export-design.mjs
 *   npm run design
 *
 * Les fichiers sont écrits à la racine du repo. Relancé automatiquement par
 * predev et prebuild.
 */
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { writeFilePreservingEol } from "./write-file-eol.mjs";
import { parseComponentDoc } from "./component-docs.mjs";

const TOKENS = "src/styles/tokens.css";
const STYLES = "src/styles/styles.css";
const OUTPUT = "design.md";
const RULES_OUTPUT = "design-rules.md";

// ── Parsers ────────────────────────────────────────────────────────────────

/** Extrait toutes les custom properties d'un bloc CSS donné. */
function parseVars(block) {
  const vars = {};
  for (const m of block.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    vars[`--${m[1]}`] = m[2].trim();
  }
  return vars;
}

/** Extrait les vars du bloc :root { … }. */
function parseRoot(css) {
  const m = css.match(/:root\s*\{([^}]+)\}/s);
  return m ? parseVars(m[1]) : {};
}

/** Extrait les vars de tous les [data-theme="dark"] { … } (peut être multiple). */
function parseDark(css) {
  const vars = {};
  for (const m of css.matchAll(/\[data-theme="dark"\]\s*\{([^}]+)\}/gs)) {
    Object.assign(vars, parseVars(m[1]));
  }
  return vars;
}

/**
 * Découpe styles.css par les commentaires de section « ── Titre ── »
 * et retourne un tableau { title, classes[] }.
 */
function parseSections(css) {
  // Les commentaires de section utilisent ─ (U+2500 BOX DRAWINGS LIGHT HORIZONTAL)
  // Ex: /* ── Layout ──────────────────────────────────────────────── */
  const SECTION_RE = /\/\*\s*[─-]{2,}\s+(.+?)\s+[─-]+\s*\*\//g;
  const sections = [];
  let last = { title: "Global", start: 0 };
  let m;

  while ((m = SECTION_RE.exec(css)) !== null) {
    last.end = m.index;
    sections.push(last);
    last = { title: m[1].trim(), start: m.index + m[0].length };
  }
  last.end = css.length;
  sections.push(last);

  return sections
    .map(({ title, start, end }) => {
      const block = css.slice(start, end);
      const classes = [
        ...new Set([...block.matchAll(/^\.([\w-]+)[\s{,]/gm)].map((x) => x[1])),
      ];
      return { title, classes };
    })
    .filter((s) => s.classes.length > 0);
}

/**
 * Liste les noms de composants depuis src/components/ (récursif, .astro),
 * suffixe retiré — la doc de nommage est dérivée du filesystem pour ne
 * jamais dériver de la réalité.
 */
async function listComponents(dir = "src/components") {
  return (await componentFiles(dir)).map((f) => f.name).sort();
}

async function componentFiles(dir) {
  const files = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.isDirectory())
      files.push(...(await componentFiles(join(dir, e.name))));
    else if (e.name.endsWith(".astro"))
      files.push({
        name: e.name.replace(/\.astro$/, ""),
        path: join(dir, e.name),
      });
  }
  return files;
}

/** Contrat documenté de chaque composant .astro, indexé par nom. */
async function readComponentDocs(dir = "src/components") {
  const docs = {};
  for (const { name, path } of await componentFiles(dir))
    if (path.endsWith(".astro"))
      docs[name] = parseComponentDoc(await readFile(path, "utf8"));
  return docs;
}

// ── Helpers Markdown ───────────────────────────────────────────────────────

function table(headers, rows) {
  const sep = headers.map(() => "---");
  return [
    `| ${headers.join(" | ")} |`,
    `| ${sep.join(" | ")} |`,
    ...rows.map((r) => `| ${r.join(" | ")} |`),
  ].join("\n");
}

function pick(vars, fn) {
  return Object.entries(vars).filter(([k]) => fn(k));
}

/** Échelle typographique : --fs-* (taille), --lh-* (interligne), --ls-* (interlettrage). */
function isTypeScale(k) {
  return /^--(fs|lh|ls)-/.test(k);
}

// ── YAML Frontmatter (google-labs-code/design.md standard) ────────────────

function yamlKey(cssVar) {
  return cssVar.replace(/^--/, "");
}

function yamlVal(v) {
  return `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function buildFrontmatter(root, dark) {
  const lines = ["---", "name: PXLC Design System"];

  const palette = pick(root, (k) => k.startsWith("--pxlc-"));
  lines.push("colors:");
  lines.push("  palette:");
  for (const [k, v] of palette) {
    lines.push(`    ${yamlKey(k)}: ${yamlVal(v)}`);
  }

  const semanticColors = pick(
    root,
    (k) =>
      !k.startsWith("--pxlc-") &&
      !k.startsWith("--font-") &&
      !isTypeScale(k) &&
      !k.startsWith("--space-") &&
      !k.startsWith("--radius-") &&
      !k.startsWith("--dur-") &&
      !k.startsWith("--ease-") &&
      !k.startsWith("--container-") &&
      !k.startsWith("--z-"),
  );
  if (semanticColors.length) {
    lines.push("  semantic:");
    for (const [k, v] of semanticColors) {
      const d = dark[k];
      if (d) {
        lines.push(`    ${yamlKey(k)}:`);
        lines.push(`      light: ${yamlVal(v)}`);
        lines.push(`      dark: ${yamlVal(d)}`);
      } else {
        lines.push(`    ${yamlKey(k)}: ${yamlVal(v)}`);
      }
    }
  }

  const fonts = pick(root, (k) => k.startsWith("--font-") || isTypeScale(k));
  if (fonts.length) {
    lines.push("typography:");
    for (const [k, v] of fonts) {
      lines.push(`  ${yamlKey(k)}: ${yamlVal(v)}`);
    }
  }

  const spaces = pick(root, (k) => k.startsWith("--space-"));
  if (spaces.length) {
    lines.push("spacing:");
    lines.push('  base: "8px"');
    for (const [k, v] of spaces) {
      lines.push(`  ${yamlKey(k)}: ${yamlVal(v)}`);
    }
  }

  const radii = pick(root, (k) => k.startsWith("--radius-"));
  if (radii.length) {
    lines.push("radius:");
    for (const [k, v] of radii) {
      lines.push(`  ${yamlKey(k)}: ${yamlVal(v)}`);
    }
  }

  const motion = pick(
    root,
    (k) => k.startsWith("--dur-") || k.startsWith("--ease-"),
  );
  if (motion.length) {
    lines.push("motion:");
    for (const [k, v] of motion) {
      lines.push(`  ${yamlKey(k)}: ${yamlVal(v)}`);
    }
  }

  const layout = pick(
    root,
    (k) => k.startsWith("--container-") || k.startsWith("--z-"),
  );
  if (layout.length) {
    lines.push("layout:");
    for (const [k, v] of layout) {
      lines.push(`  ${yamlKey(k)}: ${yamlVal(v)}`);
    }
  }

  lines.push("---");
  return lines.join("\n") + "\n";
}

// ── Main ───────────────────────────────────────────────────────────────────

const main = async () => {
  const [tokensCss, stylesCss, components, componentDocs] = await Promise.all([
    readFile(TOKENS, "utf8"),
    readFile(STYLES, "utf8"),
    listComponents(),
    readComponentDocs(),
  ]);

  const root = parseRoot(tokensCss);
  const dark = parseDark(tokensCss);
  const sections = parseSections(stylesCss);

  const md = [];

  md.push(buildFrontmatter(root, dark));

  // ── En-tête ──────────────────────────────────────────────────────────────
  md.push("# PXLC — Design System\n");
  md.push("> Généré automatiquement par `scripts/export-design.mjs`.");
  md.push(
    "> Source : `src/styles/tokens.css` + `styles.css` + `src/components/`.",
  );
  md.push(
    "> Relancer `npm run design` après toute modification des sources CSS ou des composants.\n",
  );

  // ── Palette ───────────────────────────────────────────────────────────────
  md.push("## Palette\n");
  const palette = pick(root, (k) => k.startsWith("--pxlc-"));
  md.push(
    table(
      ["Token", "Hex / valeur"],
      palette.map(([k, v]) => [`\`${k}\``, `\`${v}\``]),
    ),
  );

  // ── Tokens sémantiques ────────────────────────────────────────────────────
  md.push("\n## Tokens sémantiques\n");
  md.push(
    "Ces tokens résolvent vers la palette et basculent automatiquement en dark mode.\n",
  );

  // Noms du design system « PXLC 2026 » (surface, ink, parent, child…),
  // puis les extensions propres au site.
  const semanticGroups = [
    [
      "Surfaces",
      (k) => ["--surface", "--surface-raised", "--surface-soft"].includes(k),
    ],
    ["Texte", (k) => ["--ink", "--ink-muted", "--ink-quiet", "--link"].includes(k)],
    ["Bordures", (k) => k === "--line" || k.startsWith("--rule")],
    [
      "Parent (grand carré du logo)",
      (k) => k.startsWith("--parent") || k === "--on-parent",
    ],
    [
      "Child (petit carré, accent unique)",
      (k) => k.startsWith("--child") || k === "--on-child",
    ],
    [
      "Extensions du site",
      (k) =>
        [
          "--bg-glass",
          "--hover-on-dark",
          "--teal-deep",
          "--teal-mid",
          "--cyan",
        ].includes(k) || k.startsWith("--map-"),
    ],
    [
      "Ombres & focus",
      (k) => k.startsWith("--shadow-") || k.startsWith("--focus-ring"),
    ],
  ];

  for (const [label, fn] of semanticGroups) {
    const rows = pick(root, fn);
    if (!rows.length) continue;
    md.push(`### ${label}\n`);
    md.push(
      table(
        ["Token", "Light", "Dark"],
        rows.map(([k, v]) => [
          `\`${k}\``,
          `\`${v}\``,
          dark[k] ? `\`${dark[k]}\`` : "—",
        ]),
      ),
    );
    md.push("");
  }

  // ── Typographie ───────────────────────────────────────────────────────────
  md.push("## Typographie\n");
  const fonts = pick(root, (k) => k.startsWith("--font-"));
  md.push(
    table(
      ["Token", "Stack"],
      fonts.map(([k, v]) => [`\`${k}\``, `\`${v}\``]),
    ),
  );
  md.push("\n### Échelle typographique (design system PXLC 2026)\n");
  const scale = pick(root, isTypeScale);
  md.push(
    table(
      ["Token", "Valeur"],
      scale.map(([k, v]) => [`\`${k}\``, `\`${v}\``]),
    ),
  );
  md.push(
    "\n> Taille `--fs-*`, interligne `--lh-*`, interlettrage `--ls-*`. Graisse : 700 pour title-1/2, 600 pour title-3, label et ui. Les chiffres d'affichage décoratifs (repères, frise, numéros d'étape) restent hors échelle.",
  );

  // ── Espacement ────────────────────────────────────────────────────────────
  md.push("\n## Espacement\n");
  md.push("Rythme 8 px.\n");
  const spaces = pick(root, (k) => k.startsWith("--space-"));
  md.push(
    table(
      ["Token", "Valeur"],
      spaces.map(([k, v]) => [`\`${k}\``, `\`${v}\``]),
    ),
  );

  // ── Radius ────────────────────────────────────────────────────────────────
  md.push("\n## Radius\n");
  const radii = pick(root, (k) => k.startsWith("--radius-"));
  md.push(
    table(
      ["Token", "Valeur"],
      radii.map(([k, v]) => [`\`${k}\``, `\`${v}\``]),
    ),
  );

  // ── Motion ────────────────────────────────────────────────────────────────
  md.push("\n## Motion\n");
  const motion = pick(
    root,
    (k) => k.startsWith("--dur-") || k.startsWith("--ease-"),
  );
  md.push(
    table(
      ["Token", "Valeur"],
      motion.map(([k, v]) => [`\`${k}\``, `\`${v}\``]),
    ),
  );

  // ── Layout ────────────────────────────────────────────────────────────────
  md.push("\n## Layout\n");
  const layout = pick(
    root,
    (k) => k.startsWith("--container-") || k.startsWith("--z-"),
  );
  md.push(
    table(
      ["Token", "Valeur"],
      layout.map(([k, v]) => [`\`${k}\``, `\`${v}\``]),
    ),
  );

  // ── Composants CSS globaux ────────────────────────────────────────────────
  md.push("\n## Composants CSS globaux\n");
  md.push(
    "Classes issues de `styles.css`. Les variantes scoped des composants sont listées dans « Composants ».\n",
  );

  const skipTitles = new Set(["Global", "Reset & globals"]);
  for (const { title, classes } of sections) {
    if (skipTitles.has(title)) continue;
    // Écarte les sélecteurs globaux (:root, body, :where)
    const filtered = classes.filter(
      (c) => !["root", "body", "where"].includes(c),
    );
    if (!filtered.length) continue;
    md.push(`### ${title}\n`);
    md.push(filtered.map((c) => `- \`.${c}\``).join("\n"));
    md.push("");
  }

  // ── Composants ────────────────────────────────────────────────────────────
  // Contrats dérivés des sources .astro (scripts/component-docs.mjs) : la
  // prose vient des commentaires JSDoc, gardés par ds-lint R13 ; variantes
  // et états sont relevés dans les <style> scoped, jamais écrits à la main.
  md.push("## Composants\n");
  md.push(
    "Généré depuis `src/components/` : description et tags `@usage` / `@a11y` du bloc JSDoc de tête, props depuis `interface Props`, variantes et états depuis le `<style>` du composant.\n",
  );
  const cell = (s) => s.replace(/\|/g, "\\|");
  const groups = [
    ["Primitives de marque (`Pxlc*`)", (n) => n.startsWith("Pxlc")],
    ["Chrome du site (`Site*`)", (n) => n.startsWith("Site")],
    [
      "Sections et blocs",
      (n) => !n.startsWith("Pxlc") && !n.startsWith("Site"),
    ],
  ];
  for (const [label, fn] of groups) {
    md.push(`### ${label}\n`);
    for (const name of components.filter(fn)) {
      const doc = componentDocs[name];
      md.push(`#### \`${name}\`\n`);
      if (doc.description) md.push(`${doc.description}\n`);
      if (doc.props.length) {
        md.push(
          table(
            ["Prop", "Type", "Défaut", "Rôle"],
            doc.props.map((p) => [
              `\`${p.name}\`${p.optional ? "" : " *"}`,
              `\`${cell(p.type)}\``,
              p.default === null ? "—" : `\`${cell(p.default)}\``,
              cell(p.doc) || "—",
            ]),
          ),
        );
        md.push("");
      } else {
        md.push("Aucune prop.\n");
      }
      const extras = [
        doc.variants.length &&
          `- **Variantes** : ${doc.variants.map((v) => `\`${v}\``).join(", ")}`,
        doc.states.length &&
          `- **États** : ${doc.states.map((v) => `\`${v}\``).join(", ")}`,
        doc.tags.usage && `- **Usage** : ${doc.tags.usage}`,
        doc.tags.a11y && `- **Accessibilité** : ${doc.tags.a11y}`,
      ].filter(Boolean);
      if (extras.length) md.push(extras.join("\n") + "\n");
    }
  }
  md.push("> `*` = prop obligatoire.\n");

  // ── Règles brand ──────────────────────────────────────────────────────────
  // À partir d'ici, tout est aussi écrit dans design-rules.md, importé par
  // CLAUDE.md : les règles seules restent en contexte à chaque session, les
  // tables de tokens et de classes (dérivables du CSS) ne se lisent qu'au besoin.
  const rulesStart = md.length;
  md.push("## Règles brand\n");

  md.push("### Copy\n");
  md.push(
    [
      "- Voix 1ère personne « je » — « je » porte les verbes d'action (j'anime, j'accompagne) ; « PXLC » est un nom de marque, jamais sujet d'un verbe d'action dans le copy page (exception : la mission verbatim)",
      "- 3e personne (« Andy Zébus, créateur de PXLC, accompagne… ») réservée aux meta/OG, mentions légales et documents qui engagent l'entité (devis, conventions, factures)",
      "- Pas d'emoji, nulle part",
      "- **Vocabulaire interdit** : addiction, désintoxication, détox numérique, coach, expert, innovant, révolutionnaire — fondement : avis HCSP du 08/03/2021, la MILDECA préfère « usage problématique des écrans » ; utiliser ce terme",
      "- **Termes naked** (sans guillemets ni traduction) : HCSP, SESSAD, TCND, TND, hyperfocus",
      "- Espaces insécables avant `!`, `?`, `:`, `;`, `»` et entre nombre + unité (`48 h`, `20 min`, `100 €`)",
      "- Chiffres en numéraux sauf en début de phrase",
      "- `Parent-Écran-Enfant` au singulier, avec majuscules et traits d'union — jamais « Parents-Écran-Enfant »",
      "- Ne jamais écrire « fondateur » — écrire « créateur de PXLC »",
      "- Nommer les clients : terme générique « les structures » — le mot que les acheteurs publics emploient pour eux-mêmes, écoles et centres socioculturels compris (consultation CCAS de Pointe-à-Pitre, 2026). « les lieux qui accueillent des familles » sert de périphrase de variation, jamais de terme canonique : « lieu d'accueil » renvoie au LAEP. En adresse directe, nommer le lieu (« votre médiathèque ») ou « votre structure »",
      "- Mission en une phrase : « PXLC accompagne les familles autour des écrans. »",
      "- Cadre réglementaire : toujours citer HCSP 2019-2020 · HAS 2020 ensemble",
      "- Toute affirmation santé/usage des écrans doit être sourcée depuis docs/references/ (document + section) — ne jamais inventer un chiffre ou une recommandation",
    ].join("\n"),
  );

  md.push("\n### Positionnement B2B\n");
  md.push(
    [
      "- **Principe** : intervenir dans les lieux qui accueillent déjà des familles — le lieu apporte le public, j'apporte l'atelier et le cadre",
      "- **Clients** = les structures qui accueillent déjà des familles : médiathèques et collectivités, centres sociaux et espaces de vie sociale, écoles et centres socioculturels, CCAS et dispositifs de réussite éducative, LAEP, SESSAD, IME, CMPP, CAMSP, dispositifs CLAS — les familles sont bénéficiaires, pas clients directs",
      "- **Posture** : partenaire institutionnel — jamais coach, expert ou gadget",
      "- **Jeu vidéo** = outil de médiation légitime — jamais un problème à résoudre",
      "- **Différenciateur** : seul pont entre 3 mondes — culture joueur / cadre du soin / langage institutionnel",
    ].join("\n"),
  );

  md.push("\n### Les 3 casquettes (ancres de légitimité)\n");
  md.push(
    [
      "1. **Organisateur esport** — Plus de 6 ans sur la scène esport guadeloupéenne, Destreland Gaming Cup. Connaissance de la communauté joueurs de l'intérieur.",
      "2. **Médiateur formé** — Formateur Simplon Outre-Mer 2021-2022. Travail dans le cadre HCSP · HAS.",
      "3. **Conseil institutionnel** — Affaires européennes et numérique THD, Région Guadeloupe. Parle le langage des projets de service.",
    ].join("\n"),
  );

  md.push("\n### Nommage des composants\n");
  // Les listes d'exemples sont dérivées de src/components/ — seule la règle
  // (l'attribution d'un préfixe) est de la prose.
  const ticks = (arr) => arr.map((n) => `\`${n}\``).join(", ");
  const pxlcNames = components.filter((n) => n.startsWith("Pxlc"));
  const siteNames = components.filter((n) => n.startsWith("Site"));
  const plainNames = components.filter(
    (n) => !pxlcNames.includes(n) && !siteNames.includes(n),
  );
  md.push(
    [
      `- **\`Pxlc*\`** — primitives de marque réutilisables partout : ${ticks(pxlcNames)}`,
      `- **\`Site*\`** — chrome du site (présent sur toutes les pages) : ${ticks(siteNames)}`,
      `- **Sans préfixe** — sections de page, blocs de contenu et utilitaires autonomes : ${ticks(plainNames)}`,
      "- Deux mots minimum par nom (évite les collisions avec de futurs éléments HTML natifs)",
    ].join("\n"),
  );

  md.push("\n### Visuel\n");
  md.push(
    [
      "- Coral max **5 %** des pixels par page ou image — exception : le logo lui-même (son petit carré en occupe environ 9 %), qu’on ne redimensionne jamais pour tenir la règle ; elle vaut pour tout le reste",
      "- Un seul CTA primaire par section",
      "- Jamais de texte blanc sur fond coral — utiliser `--on-child`",
      "- Pas de gradients, pas d'emoji en iconographie",
      "- **Typographie** : tailles de texte via l'échelle `--fs-title-1|2|3`, `--fs-lead`, `--fs-body`, `--fs-body-sm`, `--fs-small`, `--fs-label`, `--fs-ui` (avec `--lh-*` / `--ls-*`) — un seul title-1 par page, jamais de taille de titre locale",
      "- **Logo** (design system PXLC 2026) : grand carré parent (`--parent`) + petit carré enfant (`--child`) en diagonale sur une grille 3×3 — ne jamais inverser les rôles, recolorer l'enfant, déformer ni pivoter (seul le filigrane, −8°, 8 % en clair / 18 % en sombre)",
      "- **Petite marque** (`PxlcMark` 20 px) : coiffe les cartes d'étape ; le motif Duo a été retiré du design system",
    ].join("\n"),
  );

  md.push("\n### OG Images\n");
  md.push(
    [
      "- Générateur : endpoints `src/pages/og/*.png.ts` (satori + resvg via `src/lib/og-templates.ts`) — disponibles aussi en dev",
      "- Carte de marque `/og/site.png` (logo + tagline), identique sur toutes les pages",
      "- Couleurs depuis `src/lib/brand-colors.ts`, polices TTF vendorées dans `src/assets/og-fonts/`",
    ].join("\n"),
  );

  // ── Écriture ──────────────────────────────────────────────────────────────
  const contentLF = md.join("\n") + "\n";
  const wrote = await writeFilePreservingEol(OUTPUT, contentLF);
  console.log(
    wrote
      ? `export-design: ${OUTPUT} écrit (${contentLF.length} chars, ${contentLF.split("\n").length} lignes)`
      : `export-design: ${OUTPUT} déjà à jour`,
  );

  const rulesLF =
    [
      "# PXLC — Règles brand",
      "",
      "> Généré automatiquement par `scripts/export-design.mjs` — extrait de",
      "> `design.md` (règles seules), importé par `CLAUDE.md`. Tokens, palette et",
      "> classes CSS : voir `design.md` ou `src/styles/tokens.css`.",
      "",
      ...md.slice(rulesStart),
    ].join("\n") + "\n";
  const wroteRules = await writeFilePreservingEol(RULES_OUTPUT, rulesLF);
  console.log(
    wroteRules
      ? `export-design: ${RULES_OUTPUT} écrit (${rulesLF.length} chars)`
      : `export-design: ${RULES_OUTPUT} déjà à jour`,
  );
};

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
