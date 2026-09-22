"""
PostToolUse hook — vérifications après chaque Edit/Write.

Deux branches selon le fichier édité :

  content/**/*.md
    → astro sync : ré-ingère la collection blog et applique son schéma zod
      (champs requis + limites SEO effectives, cf. src/content.config.ts).
      Échec = exit 2 : le détail est renvoyé à Claude pour correction
      immédiate, au lieu d'attendre le build.

  *.vue / *.ts / *.js / *.mjs
    → 1. fix-curly-quotes.py (même payload stdin) — séquencé ici plutôt
         qu'enregistré en parallèle pour éviter une écriture concurrente
         du même fichier.
      2. eslint --fix sur le fichier. Erreurs restantes = exit 2.

Convention Claude Code : exit 0 = ok, exit 2 = feedback bloquant renvoyé
au modèle (stderr).
"""
import json
import os
import subprocess
import sys

# Sortie UTF-8 quel que soit l'encodage console Windows (cp1252 par défaut).
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.stderr.reconfigure(encoding="utf-8", errors="replace")

payload = json.load(sys.stdin)
file_path = payload.get("tool_input", {}).get("file_path", "")
if not file_path:
    sys.exit(0)

norm = file_path.replace("\\", "/")
if any(seg in norm for seg in ("/node_modules/", "/.astro/", "/dist/")):
    sys.exit(0)

# Les hooks sont lancés depuis la racine du projet (ou du worktree).
ROOT = os.getcwd()
HOOKS_DIR = os.path.dirname(os.path.abspath(__file__))

# Ne traiter que les fichiers du projet courant.
if not os.path.abspath(file_path).lower().startswith(ROOT.lower()):
    sys.exit(0)


def run(cmd, **kwargs):
    return subprocess.run(
        cmd, capture_output=True, text=True,
        encoding="utf-8", errors="replace", **kwargs,
    )


# ---------------------------------------------------------------------------
# Articles de la collection blog — schéma zod (astro sync)
# ---------------------------------------------------------------------------
if norm.endswith(".md") and "/content/" in norm:
    astro_bin = os.path.join(ROOT, "node_modules", "astro", "bin", "astro.mjs")
    if not os.path.exists(astro_bin):
        sys.exit(0)
    r = run(["node", astro_bin, "sync"])
    if r.returncode != 0:
        print(
            "[hook] astro sync a échoué après édition de "
            f"{file_path} (schéma de collection) :\n{r.stdout}{r.stderr}",
            file=sys.stderr,
        )
        sys.exit(2)
    print(f"[hook] astro sync OK ({file_path})")
    sys.exit(0)

# ---------------------------------------------------------------------------
# Code — guillemets typographiques puis ESLint --fix
# ---------------------------------------------------------------------------
if norm.endswith((".vue", ".ts", ".js", ".mjs")):
    curly = os.path.join(HOOKS_DIR, "fix-curly-quotes.py")
    if os.path.exists(curly):
        r = run([sys.executable, curly], input=json.dumps(payload))
        if r.stdout.strip():
            print(r.stdout.strip())

    eslint = os.path.join(ROOT, "node_modules", "eslint", "bin", "eslint.js")
    if not os.path.exists(eslint):
        sys.exit(0)
    r = run(["node", eslint, "--fix", file_path])
    if r.returncode != 0:
        print(
            f"[hook] ESLint signale des erreurs dans {file_path} "
            f"(après --fix) :\n{r.stdout}{r.stderr}",
            file=sys.stderr,
        )
        sys.exit(2)

sys.exit(0)
