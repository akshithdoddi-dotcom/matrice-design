#!/usr/bin/env bash
# install-dev-hooks.sh — wires native git hooks + the pre-commit framework
# into a freshly-cloned matrice-ai consumer repo.
#
# Run once after `git clone`:
#   ./scripts/install-dev-hooks.sh
#
# What this does:
#   1. `git config --local core.hooksPath scripts/git-hooks`
#      Points git at the version-controlled hook directory shipped with
#      the repo (so `.git/hooks/*` is bypassed; everyone gets the same
#      hooks regardless of when they cloned).
#
#   2. `pre-commit install --hook-type pre-commit --hook-type commit-msg`
#      Wires the pre-commit framework hooks declared in
#      .pre-commit-config.yaml. The commit-msg hook injects the
#      Pre-Commit-Verified-* trailer (CICD-101 P1.1) so subsequent
#      pushes pass the local pre-push gate.
#
# After install, every `git push` runs scripts/git-hooks/pre-push which
# in turn runs scripts/check-precommit-trailer.sh and
# scripts/check-cicd-failures.sh. Failure blocks the push.
#
# Bypass (logged + audited): git push --no-verify

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "${REPO_ROOT}" ]]; then
  echo "❌ Not inside a git working tree. Run from the repo root."
  exit 1
fi
cd "${REPO_ROOT}"

# 1. Native git hooks dir
if [[ ! -d "scripts/git-hooks" ]]; then
  echo "❌ scripts/git-hooks/ missing in this repo."
  echo "   The repo should ship the hook directory; ask Tech Head if absent."
  exit 1
fi

git config --local core.hooksPath scripts/git-hooks
chmod +x scripts/git-hooks/* scripts/check-precommit-trailer.sh scripts/check-cicd-failures.sh 2>/dev/null || true
echo "✓ Set core.hooksPath -> scripts/git-hooks"

# 2. pre-commit framework
if ! command -v pre-commit >/dev/null 2>&1; then
  echo "⚠ pre-commit not on PATH. Install with:"
  echo "    pipx install pre-commit   # preferred"
  echo "    # OR"
  echo "    pip install --user pre-commit"
  echo ""
  echo "  Re-run this script after install."
  exit 2
fi

if [[ ! -f ".pre-commit-config.yaml" ]]; then
  echo "⚠ .pre-commit-config.yaml missing — skipping pre-commit framework wiring."
  echo "  Native pre-push hook is still active."
  exit 0
fi

pre-commit install --hook-type pre-commit --hook-type commit-msg --overwrite
echo "✓ pre-commit framework hooks installed (pre-commit, commit-msg)"

# 3. Sanity: print active hook paths
echo ""
echo "Active hooks:"
echo "  core.hooksPath:   $(git config --local core.hooksPath)"
for h in pre-commit commit-msg pre-push; do
  if [[ -x ".git/hooks/${h}" ]] || [[ -x "scripts/git-hooks/${h}" ]]; then
    echo "  ${h}: ✓"
  else
    echo "  ${h}: (none)"
  fi
done

echo ""
echo "Done. Subsequent git push will be gated by:"
echo "  • Pre-Commit-Verified trailer presence + freshness (≤7 days)"
echo "  • Resolution of any prior CI failures recorded in .cicd-failures.md"
