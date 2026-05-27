#!/usr/bin/env bash
# CICD-101 P1.1 — adds Pre-Commit-Verified-* trailers to commit messages.
#
# Layer 1: Detailed trailer recording hooks list + content hash + tool version.
# Layer 2: Commit signature (already enforced by org ruleset) covers the trailer,
#          so a fake trailer is signed-by-spoofer (audit trail to that signer).
# Layer 3: CI's pre-commit.yml `detect-trailer` job validates the trailer
#          (recomputes hash, checks hook list, validates timestamp window).
# Layer 4: Even with a valid trailer, CI ALWAYS re-runs the security slice
#          (trufflehog/gitleaks/detect-secrets) regardless. Trailer only
#          enables skipping of style/format hooks server-side.
#
# Distributed to consumer repos via mass-sync (sync_repo.py).
# Source-of-truth: matrice-ai/.github scripts/precommit-add-trailer.sh

set -eu

MSG_FILE="${1:-}"
[ -z "$MSG_FILE" ] && exit 0
[ ! -f "$MSG_FILE" ] && exit 0

# Idempotent on amend: skip if trailer already present
if grep -q "^Pre-Commit-Verified-Hash:" "$MSG_FILE" 2>/dev/null; then
  exit 0
fi

# Skip merge / squash commit messages (no diff to hash, and hooks didn't run on
# the same staging that made the commit message)
if grep -qE "^(Merge|Squashed)" "$MSG_FILE" 2>/dev/null; then
  exit 0
fi

# Canonical hook list (CICD-101 — keep in sync with .pre-commit-config.template.yaml)
HOOKS_LIST="trailing-whitespace,end-of-file-fixer,check-yaml,check-merge-conflict,check-added-large-files,check-case-conflict,check-symlinks,detect-private-key,mixed-line-ending,trufflehog,gitleaks,detect-secrets,gitlint,insert-license"

# Content hash of the staged diff (stable: same staged tree → same hash)
CONTENT_HASH=$(git diff --cached --no-color | sha256sum | cut -d' ' -f1)
TOOL_VERSION=$(pre-commit --version 2>/dev/null | awk '{print $2}' || echo "unknown")
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Append trailers (separate from commit body by blank line if needed)
{
  echo ""
  echo "Pre-Commit-Verified-Hash: sha256:${CONTENT_HASH}"
  echo "Pre-Commit-Verified-Tool: pre-commit==${TOOL_VERSION}"
  echo "Pre-Commit-Verified-Hooks: 14"
  echo "Pre-Commit-Verified-Hooks-List: ${HOOKS_LIST}"
  echo "Pre-Commit-Verified-Result: all-passed"
  echo "Pre-Commit-Verified-At: ${TIMESTAMP}"
} >> "$MSG_FILE"
