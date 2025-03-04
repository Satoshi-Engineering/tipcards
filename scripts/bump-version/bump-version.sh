#!/bin/sh

# exit if any command in the script exits with a code != 0
set -e

# check if there are any uncommited changes in the working directory
if [ -n "$(git status --porcelain)" ]; then
  echo "There are uncommitted changes in the working directory. Please commit or stash them before bumping the version."
  exit 1
fi

# check if we are on the main branch
if [ "$(git branch --show-current)" != "main" ]; then
  echo "You must be on the main branch to bump the version."
  exit 1
fi

# increase the version number in package.json and generate the changelog
CHANGELOG=$(npx changelogen --bump --output CHANGELOG.md)

NEXT_VERSION="v$(jq -r '.version' package.json)"

git add package.json package-lock.json CHANGELOG.md
git commit -m "chore(release): $NEXT_VERSION" --no-verify

# Tag the new commit with the new version and the changelog
git tag -a $NEXT_VERSION -m "$CHANGELOG"
