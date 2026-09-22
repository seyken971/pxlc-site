"""
PostToolUse hook — remplace les guillemets typographiques délimiteurs de
string par des guillemets droits, dans le code uniquement.

L'outil Edit peut introduire des guillemets typographiques comme délimiteurs
de string JS, ce qui casse ESLint ("Parsing error: Invalid character").
La copy du site, elle, exige l'apostrophe typographique (U+2019) : elle
n'est jamais touchée quand elle est entre deux lettres.

Remplacements dans le code :
  U+2018 ' LEFT SINGLE QUOTATION MARK  → U+0027 ' (toujours)
  U+201C " LEFT DOUBLE QUOTATION MARK  → U+0022 " (toujours)
  U+2019 ' RIGHT SINGLE QUOTATION MARK → U+0027 '
    SEULEMENT si U+2019 est en position de délimiteur, c'est-à-dire
    NON flanqué de deux word chars Unicode.

  Heuristique : un U+2019 entre deux word chars (ex: d'évaluation, l'équipe)
  est une apostrophe de contenu — valide en JS dans une string, conservée.
  Un U+2019 suivi d'une virgule, parenthèse, fin de ligne, etc. est un
  délimiteur fermant invalide — remplacé par U+0027.

  Exemples :
    'duree'          (U+2018 + U+2019)  →  'duree'           ✓
    'indicateurs d'évaluation'           →  'indicateurs d'évaluation'
      ^U+2018                ^U+2019(×2)   ^U+0027        ^U+2019 conservé  ^U+0027

  U+201D " RIGHT DOUBLE QUOTATION MARK n'est pas remplacé.

Zones traitées selon le fichier :
  .ts / .js / .mjs → tout le fichier.
  .astro           → frontmatter (entre les `---` de tête) et blocs
                     <script>. Le balisage (texte, attributs, expressions
                     {…} du template) porte la copy : jamais modifié ; un
                     délimiteur typographique qui s'y glisserait est signalé
                     par ESLint (eslint-plugin-astro) dans post-edit-checks.
"""
import json
import re
import sys

# ---------------------------------------------------------------------------
# Patterns compilés
# ---------------------------------------------------------------------------

# Frontmatter .astro : bloc `---` en tête de fichier.
_FRONTMATTER_RE = re.compile(r'\A(---[^\S\r\n]*\r?\n)(.*?)(\r?\n---)', re.DOTALL)

# Blocs <script> (y compris <script is:inline>, <script define:vars={…}>).
_SCRIPT_BLOCK_RE = re.compile(r'(<script\b[^>]*>)(.*?)(</script>)', re.DOTALL)

# U+2019 délimiteur : NON flanqué de deux word chars Unicode.
# Exemple conservé  : d'évaluation  (d=\w, é=\w → pas de match)
# Exemple remplacé  : 'test',       (` après U+2019 = non-\w → match)
#
# Le pattern "(?<!\w)’ | ’(?!\w)" signifie :
#   U+2019 non précédé d'un word char  OU  U+2019 non suivi d'un word char
#   → on ne touche que les U+2019 qui ne sont pas entre deux lettres/chiffres.
_U2019_DELIMITER_RE = re.compile(r'(?<!\w)’|’(?!\w)', re.UNICODE)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _fix_js_quotes(text: str) -> str:
    """Corrige les guillemets typographiques dans du JS/TS.

    - U+2018 ' → ' (toujours délimiteur ouvrant, jamais apostrophe de contenu)
    - U+201C " → " (toujours délimiteur ouvrant)
    - U+2019 ' → ' seulement si délimiteur (non flanqué de deux word chars)
    - U+2019 entre deux word chars (d'évaluation, l'équipe, s'étend…) → conservé
    """
    text = text.replace('‘', "'").replace('“', '"')
    text = _U2019_DELIMITER_RE.sub("'", text)
    return text


def _fix_astro_quotes(content: str) -> str:
    """Applique _fix_js_quotes au frontmatter et aux blocs <script> d'un .astro."""
    def _replace(m: re.Match) -> str:
        return m.group(1) + _fix_js_quotes(m.group(2)) + m.group(3)
    content = _FRONTMATTER_RE.sub(_replace, content, count=1)
    return _SCRIPT_BLOCK_RE.sub(_replace, content)


# ---------------------------------------------------------------------------
# Tests inline
# ---------------------------------------------------------------------------
# Cas couverts :
#   1. Paire simple U+2018/U+2019 sans apostrophe interne
#   2. U+2019 apostrophe de contenu conservée (entre deux word chars)
#   3. Cas mixte : ouverture U+2018 + apostrophe U+2019 interne + fermeture U+2019
#   4. U+2019 suivi d'une virgule → délimiteur fermant
#   5. U+2019 en fin de ligne → délimiteur fermant
#   6. U+2019 entre lettre et lettre accentuée (ex : d'évaluation)
#   7. U+2018 en milieu de phrase → toujours remplacé
#   8. U+201C ouvrant → guillemet droit
# ---------------------------------------------------------------------------
_TESTS = [
    # (input, expected_output, description)

    # Cas 1 — paire simple
    ("‘duree’",
     "'duree'",
     "U+2018+U+2019 paire simple"),

    # Cas 2 — apostrophe de contenu conservée (straight-quoted string)
    ("a = 'indicateurs d’évaluation'",
     "a = 'indicateurs d’évaluation'",
     "apostrophe contenu entre d et é conservée"),

    # Cas 3 — U+2018 ouvrant + apostrophe interne U+2019 + U+2019 fermant
    ("‘Quelle durée d’un dispositif’",
     "'Quelle durée d’un dispositif'",
     "U+2018 open + apostrophe d’un + U+2019 close"),

    # Cas 3b — string avec plusieurs apostrophes internes
    ("‘l’équipe s’engage’",
     "'l’équipe s’engage'",
     "deux apostrophes internes, U+2019 close final"),

    # Cas 4 — U+2019 suivi d'une virgule
    ("q: ‘test’,",
     "q: 'test',",
     "U+2019 close avant virgule"),

    # Cas 5 — U+2019 en fin de ligne
    ("q: ‘test’\n",
     "q: 'test'\n",
     "U+2019 close en fin de ligne"),

    # Cas 6 — apostrophe accentuée : d'évaluation (d + U+2019 + é)
    ("d’évaluation",
     "d’évaluation",
     "apostrophe d’évaluation conservée"),

    # Cas 7 — U+2018 isolé → toujours remplacé
    ("title: ‘Mon titre’",
     "title: 'Mon titre'",
     "U+2018 remplacé globalement"),

    # Cas 8 — U+2019 après '?' (non-word) → remplacé (délimiteur)
    ("{ q: ‘test ?’, a: 'foo' }",
     "{ q: 'test ?', a: 'foo' }",
     "U+2019 après ? → délimiteur"),

    # Cas 9 — U+201C ouvrant
    ("x = “a”",
     'x = "a”',
     "U+201C remplacé, U+201D conservé"),
]

# Fichiers .astro complets : seules les zones de code bougent.
_ASTRO_TESTS = [
    ("---\nconst t = ‘Jouons’\n---\n<p>‘Aujourd’hui’ et “ici”</p>\n",
     "---\nconst t = 'Jouons'\n---\n<p>‘Aujourd’hui’ et “ici”</p>\n",
     "frontmatter corrigé, copy du template intacte"),

    ("<p>l’atelier</p>\n<script>\nconst a = ‘x’\n</script>\n",
     "<p>l’atelier</p>\n<script>\nconst a = 'x'\n</script>\n",
     "bloc <script> corrigé, copy intacte"),

    ("<p>Pas de frontmatter ‘ici’</p>\n---\nconst a = ‘x’\n---\n",
     "<p>Pas de frontmatter ‘ici’</p>\n---\nconst a = ‘x’\n---\n",
     "--- hors tête de fichier ignoré"),
]


def _run_tests() -> None:
    errors = []
    cases = [(_fix_js_quotes, *t) for t in _TESTS]
    cases += [(_fix_astro_quotes, *t) for t in _ASTRO_TESTS]
    for fn, inp, expected, desc in cases:
        result = fn(inp)
        if result != expected:
            errors.append(
                f"FAIL [{desc}]\n"
                f"  input:    {repr(inp)}\n"
                f"  got:      {repr(result)}\n"
                f"  expected: {repr(expected)}"
            )
    if errors:
        print("[hook] fix-curly-quotes: TESTS ÉCHOUÉS", file=sys.stderr)
        for e in errors:
            print(e, file=sys.stderr)
        sys.exit(1)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
d = json.load(sys.stdin)
f = d.get("tool_input", {}).get("file_path", "")

if not f or not f.endswith((".astro", ".ts", ".js", ".mjs")):
    sys.exit(0)

_run_tests()

try:
    # newline="" : conserve les fins de ligne (CRLF/LF) telles quelles.
    with open(f, encoding="utf-8", newline="") as fh:
        content = fh.read()

    if f.endswith(".astro"):
        fixed = _fix_astro_quotes(content)
    else:
        # Fichiers JS/TS purs — pas de template, appliquer partout
        fixed = _fix_js_quotes(content)

    if fixed != content:
        with open(f, "w", encoding="utf-8", newline="") as fh:
            fh.write(fixed)
        print(f"[hook] guillemets typographiques corrigés dans {f}")
except Exception as e:
    print(f"[hook] fix-curly-quotes ignoré : {e}", file=sys.stderr)
