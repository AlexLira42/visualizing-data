#!/usr/bin/env bash
set -euo pipefail
# Sync the local Claude Code skill folder into this repo clone and push.
# Run after editing ~/.claude/skills/visualizing-data.
#
#   ./sync.sh
#
# Override the skill path if needed:  SKILL=/path/to/skill ./sync.sh

SKILL="${SKILL:-$HOME/.claude/skills/visualizing-data}"
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -d "$SKILL" ]; then
  echo "Skill folder not found: $SKILL" >&2
  exit 1
fi

# Mirror skill -> repo. --delete propagates removals/renames.
# Repo-only meta files are excluded so they are never wiped.
rsync -a --delete \
  --exclude='.git' --exclude='.DS_Store' --exclude='node_modules' --exclude='__pycache__' \
  --exclude='README.md' --exclude='LICENSE' --exclude='.gitignore' --exclude='sync.sh' \
  "$SKILL"/ "$REPO"/

cd "$REPO"
if git diff --quiet && git diff --cached --quiet; then
  echo "No changes to sync."
  exit 0
fi

git add -A
git commit -m "sync skill update: $(date '+%Y-%m-%d %H:%M')"
git push
echo "Synced and pushed."
