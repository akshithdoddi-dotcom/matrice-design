#!/usr/bin/env bash
# check-cicd-failures.sh — pre-push gate for matrice-ai consumer repos.
# Pulled at runtime via `curl -sSfL` from .github repo prod branch.
# Refuses push if any prior CI failure is unresolved in .cicd-failures.md.

set -euo pipefail

REPORT=".cicd-failures.md"
[[ -f "$REPORT" ]] || { echo "✓ No prior CI failures recorded — push allowed"; exit 0; }

# Use python3 for reliable markdown parsing
python3 - <<'PY'
import re, sys, pathlib

p = pathlib.Path(".cicd-failures.md")
text = p.read_text()

# Find all check-name H3 entries under "## Failed Checks"
in_failed = False
in_log = False
failed_checks = []
resolutions = {}  # name -> resolution-line

for line in text.splitlines():
    if line.startswith("## Failed Checks"):
        in_failed = True; in_log = False; continue
    if line.startswith("## Resolutions Log"):
        in_failed = False; in_log = True; continue
    if line.startswith("## "):
        in_failed = in_log = False; continue
    if in_failed:
        m = re.match(r"^### (.+)$", line.strip())
        if m: failed_checks.append(m.group(1).strip())
    if in_log:
        m = re.match(r"^- \[x\] (\S+)\s*[—-]+\s*(FIXED-IN|MANUALLY-VERIFIED-BY)[:\s]+(.+)$", line.strip())
        if m:
            resolutions[m.group(1)] = (m.group(2), m.group(3))

unresolved = [c for c in failed_checks if c not in resolutions]
if unresolved:
    print("\n❌ Push blocked — unresolved CI failures in .cicd-failures.md:\n")
    for c in unresolved:
        print(f"   - {c}")
    print("\nFix locally and add to Resolutions Log:")
    print("   - [x] <check-name> — FIXED-IN: <sha-or-this-commit>")
    print("Or mark as manually verified:")
    print("   - [x] <check-name> — MANUALLY-VERIFIED-BY: @<your-handle> — <reason>")
    print("\nBypass with `git push --no-verify` (logged + audited).")
    sys.exit(1)

print(f"✓ All {len(failed_checks)} prior CI failures resolved/verified — push allowed")
PY
