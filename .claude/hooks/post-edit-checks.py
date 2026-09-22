"""
PostToolUse hook — vérifications après chaque Edit/Write.

  *.astro / *.ts / *.js / *.mjs
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


def find_node_module(*parts):
    """Cherche node_modules/<parts> en remontant depuis ROOT, comme Node :
    un worktree (.claude/worktrees/…) n'a pas de node_modules propre et
    résout celui du dépôt principal."""
    d = ROOT
    while True:
        p = os.path.join(d, "node_modules", *parts)
        if os.path.exists(p):
            return p
        parent = os.path.dirname(d)
        if parent == d:
            return None
        d = parent


# ---------------------------------------------------------------------------
# Code — guillemets typographiques puis ESLint --fix
# ---------------------------------------------------------------------------
if norm.endswith((".astro", ".ts", ".js", ".mjs")):
    curly = os.path.join(HOOKS_DIR, "fix-curly-quotes.py")
    if os.path.exists(curly):
        r = run([sys.executable, curly], input=json.dumps(payload))
        if r.stdout.strip():
            print(r.stdout.strip())

    eslint = find_node_module("eslint", "bin", "eslint.js")
    if not eslint:
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
