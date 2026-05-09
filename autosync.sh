#!/bin/bash
# Auto-sync script: commits all changes and pushes to GitHub

if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ GITHUB_TOKEN not set. Please add it to Replit Secrets."
  exit 1
fi

REPO_URL="https://x-access-token:${GITHUB_TOKEN}@github.com/twswithcrew009-lgtm/trri.git"

git add -A

if git diff --cached --quiet; then
  echo "📦 Nothing new to commit — pushing existing commits to GitHub..."
else
  TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
  git commit -m "Auto-sync: $TIMESTAMP"
  echo "✅ Committed changes."
fi

git push "$REPO_URL" main
echo "✅ Changes pushed to GitHub successfully!"
