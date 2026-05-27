#!/usr/bin/env bash
# check-precommit-trailer.sh — pre-push gate for matrice-ai consumer repos.
# Pulled at runtime via `curl -sSfL` from .github repo prod branch.
# Refuses push unless HEAD commit has a valid Pre-Commit-Verified trailer
# matching the CICD-101 P1.1 server-side contract:
#   - Pre-Commit-Verified-Result: all-passed
#   - Pre-Commit-Verified-At: <ISO-8601 UTC, within 7 days>
#   (Pre-Commit-Verified-Hash is NOT validated client-side — server validates;
#    keeping client check minimal avoids cross-platform diff-hash semantics.)
#
# Bypass: git push --no-verify (logged to ~/.cache/matrice-precommit-bypass.log
# by the org-side audit hook in PR-2's cicd-report-validator workflow).

set -euo pipefail

# Cross-platform date parsing (macOS uses gdate from coreutils if available;
# falls back to BSD `date -j -f` parser).
parse_iso8601() {
  local input="$1"
  if command -v gdate >/dev/null 2>&1; then
    gdate -d "$input" +%s 2>/dev/null && return 0
  fi
  date -d "$input" +%s 2>/dev/null && return 0
  date -j -f "%Y-%m-%dT%H:%M:%SZ" "$input" +%s 2>/dev/null && return 0
  echo 0
}

EXIT_CODE=0

# Pre-push hook stdin protocol: <local_ref> <local_sha> <remote_ref> <remote_sha>
while read local_ref local_sha remote_ref remote_sha; do
  # Skip deletions.
  [[ "$local_sha" == "0000000000000000000000000000000000000000" ]] && continue

  # Skip merge commits — CICD-101 P1.1 add-trailer hook also skips them.
  IS_MERGE=$(git rev-list --no-walk --count --merges "$local_sha" 2>/dev/null || echo 0)
  if [[ "$IS_MERGE" != "0" ]]; then
    echo "ℹ Skipping merge commit $(git log -1 --format='%h' "$local_sha")"
    continue
  fi

  TRAILERS=$(git log -1 --format='%(trailers:unfold)' "$local_sha")
  COMMIT_DESC=$(git log -1 --format='%h %s' "$local_sha")

  # Required: Result must be all-passed
  if ! grep -q "^Pre-Commit-Verified-Result: all-passed$" <<<"$TRAILERS"; then
    echo ""
    echo "❌ Push blocked — HEAD commit missing valid Pre-Commit-Verified trailer"
    echo "   Commit: $COMMIT_DESC"
    echo ""
    echo "Sign locally:  pre-commit run --all-files && git commit --amend --no-edit"
    echo "(the existing scripts/precommit-add-trailer.sh commit-msg hook"
    echo " will inject the trailer automatically)"
    echo ""
    echo "Bypass:        git push --no-verify  (logged + audited)"
    EXIT_CODE=1
    continue
  fi

  # Required: timestamp within 7 days (matches server-side CICD-101 P1.1 check)
  TIMESTAMP=$(grep "^Pre-Commit-Verified-At:" <<<"$TRAILERS" | sed 's/^[^:]*: *//' | head -1)
  if [[ -z "$TIMESTAMP" ]]; then
    echo ""
    echo "❌ Push blocked — trailer present but Pre-Commit-Verified-At is missing"
    echo "   Commit: $COMMIT_DESC"
    EXIT_CODE=1
    continue
  fi

  NOW_TS=$(date +%s)
  SIGNED_TS=$(parse_iso8601 "$TIMESTAMP")
  if [[ "$SIGNED_TS" -eq 0 ]]; then
    echo "⚠ Could not parse Pre-Commit-Verified-At timestamp ($TIMESTAMP); allowing push"
    continue
  fi

  AGE_SECONDS=$(( NOW_TS - SIGNED_TS ))
  AGE_DAYS=$(( AGE_SECONDS / 86400 ))
  if (( AGE_DAYS > 7 )); then
    echo ""
    echo "❌ Push blocked — trailer is $AGE_DAYS days old (max 7)"
    echo "   Commit: $COMMIT_DESC"
    echo "   Re-sign: pre-commit run --all-files && git commit --amend --no-edit"
    EXIT_CODE=1
    continue
  fi
done

if [[ "$EXIT_CODE" -eq 0 ]]; then
  echo "✓ Pre-Commit-Verified trailer valid on HEAD commit"
fi

exit "$EXIT_CODE"
