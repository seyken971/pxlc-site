/**
 * Extrait le contrat documenté d'un composant .astro — description, tags,
 * props, variantes et états — depuis sa source. Partagé par
 * export-design.mjs (section « Composants » de design.md) et ds-lint.mjs
 * (R13 doc-composant) : la doc et la gate lisent la même chose.
 *
 * Convention, dans le frontmatter :
 *
 *   /**
 *    * Une phrase : rôle du composant.
 *    * @usage Où et combien de fois.
 *    * @a11y  Ce que garantit le composant.
 *    *\/
 *   interface Props {
 *     /** Chaque prop documentée. *\/
 *     count?: number
 *   }
 *   const { count = 3 } = Astro.props
 *
 * Le bloc descriptif est le premier `/** … *\/` placé avant toute
 * déclaration (les imports peuvent l'entourer). Regex, pas de parser TS :
 * même approche que export-design.
 */

/** Frontmatter brut (sans les délimiteurs ---), ou "". */
function frontmatter(src) {
  return src.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
}

/** Texte d'un commentaire JSDoc : délimiteurs et « * » de marge retirés. */
function jsdocText(body) {
  return body
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*\*?\s?/, "").trimEnd())
    .join("\n")
    .trim();
}

/** Sépare le texte libre des tags @usage / @a11y (valeurs multilignes). */
function splitTags(text) {
  const tags = {};
  const [head, ...rest] = text.split(/^@(?=\w)/m);
  for (const chunk of rest) {
    const m = chunk.match(/^(\w+)\s*([\s\S]*)$/);
    if (m) tags[m[1]] = oneLine(m[2]);
  }
  return { description: oneLine(head), tags };
}

const oneLine = (s) => s.replace(/\s*\n\s*/g, " ").trim();

const DECLARATION_RE =
  /^\s*(?:export\s+)?(?:interface|type|const|let|function|class)\b/;

/** Premier JSDoc du frontmatter situé avant toute déclaration. */
function componentComment(fm) {
  const re = /\/\*\*([\s\S]*?)\*\//g;
  let m;
  while ((m = re.exec(fm)) !== null) {
    const before = fm.slice(0, m.index);
    if (before.split(/\r?\n/).some((l) => DECLARATION_RE.test(l))) return null;
    return jsdocText(m[1]);
  }
  return null;
}

/** Corps de `interface Props { … }` (accolades équilibrées), ou null. */
function propsBody(fm) {
  const m = fm.match(/(?:export\s+)?interface\s+Props\s*\{/);
  if (!m) return null;
  const start = m.index + m[0].length;
  let depth = 1;
  for (let i = start; i < fm.length; i++) {
    if (fm[i] === "{") depth++;
    else if (fm[i] === "}" && --depth === 0) return fm.slice(start, i);
  }
  return null;
}

/** Membres d'une interface : JSDoc facultatif, nom, ?, type. */
function parseMembers(body) {
  const MEMBER_RE =
    /(?:\/\*\*([\s\S]*?)\*\/\s*)?\b([A-Za-z_$][\w$]*)(\?)?\s*:\s*([^\n,;]+?)\s*(?=[,;\n]|$)/g;
  return [...body.matchAll(MEMBER_RE)].map((m) => ({
    name: m[2],
    optional: Boolean(m[3]),
    type: m[4].trim(),
    doc: m[1] ? oneLine(jsdocText(m[1])) : "",
  }));
}

/** Découpe sur les virgules de premier niveau (chaînes et parenthèses respectées). */
function splitTopLevel(s) {
  const parts = [];
  let depth = 0;
  let quote = null;
  let cur = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quote) {
      if (c === "\\") {
        cur += c + s[++i];
        continue;
      }
      if (c === quote) quote = null;
    } else if (c === "'" || c === '"' || c === "`") quote = c;
    else if ("([{".includes(c)) depth++;
    else if (")]}".includes(c)) depth--;
    else if (c === "," && depth === 0) {
      parts.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  if (cur.trim()) parts.push(cur);
  return parts;
}

/** Valeurs par défaut des destructurations `const { … } = Astro.props`. */
function parseDefaults(fm) {
  const defaults = {};
  for (const m of fm.matchAll(/const\s*\{([\s\S]*?)\}\s*=\s*Astro\.props/g)) {
    const body = m[1]
      .split(/\r?\n/)
      .filter((l) => !/^\s*\/\//.test(l))
      .join("\n");
    for (const part of splitTopLevel(body)) {
      const d = part.match(/^\s*([\w$]+)(?:\s*:\s*[\w$]+)?\s*=\s*([\s\S]+?)\s*$/);
      if (d) defaults[d[1]] = oneLine(d[2]);
    }
  }
  return defaults;
}

/** Modificateurs (`bloc--x`, `is-x`) et états (pseudo-classes, attributs) du <style>. */
function parseStyle(src) {
  const css = [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
    .map((m) => m[1].replace(/\/\*[\s\S]*?\*\//g, ""))
    .join("\n");
  const variants = new Set();
  const states = new Set();
  // Sélecteurs seuls : ce qui précède chaque « { ».
  for (const [, sel] of css.matchAll(/([^{}]+)\{/g)) {
    if (sel.trim().startsWith("@")) {
      if (/prefers-reduced-motion/.test(sel)) states.add("prefers-reduced-motion");
      continue;
    }
    for (const [, v] of sel.matchAll(/\.([a-z][\w-]*--[\w-]+|is-[\w-]+)/g))
      variants.add(`.${v}`);
    for (const [, s] of sel.matchAll(
      /:(hover|focus-visible|focus-within|active|disabled|checked|invalid|target)\b/g,
    ))
      states.add(`:${s}`);
    // [data-theme] = mode sombre, pas un état du composant.
    for (const [, a] of sel.matchAll(/\[((?:aria|data)-[\w-]+)(?:[~|^$*]?=[^\]]*)?\]/g))
      if (a !== "data-theme") states.add(`[${a}]`);
  }
  return { variants: [...variants].sort(), states: [...states].sort() };
}

/**
 * Contrat d'un composant.
 * @returns {{ description: string|null, tags: Record<string,string>,
 *   props: {name:string, type:string, optional:boolean, default:string|null, doc:string}[],
 *   variants: string[], states: string[] }}
 */
export function parseComponentDoc(src) {
  const fm = frontmatter(src);
  const comment = componentComment(fm);
  const { description, tags } = comment
    ? splitTags(comment)
    : { description: null, tags: {} };
  const body = propsBody(fm);
  const defaults = parseDefaults(fm);
  const props = body
    ? parseMembers(body).map((p) => ({ ...p, default: defaults[p.name] ?? null }))
    : [];
  return { description: description || null, tags, props, ...parseStyle(src) };
}
