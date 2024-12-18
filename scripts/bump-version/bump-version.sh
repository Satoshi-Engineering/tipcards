#!/bin/sh

# exit if any command in the script exits with a code != 0
set -e

# changing package.json version
CURRENT_VERSION=$(git describe --tags --abbrev=0)
NEXT_VERSION=$(npm version patch --no-git-tag-version --silent)
echo "Bumping version from $CURRENT_VERSION to $NEXT_VERSION"
git add package.json package-lock.json
git commit -m "chore(release): $NEXT_VERSION" --no-verify

# create tag for changelogn
git tag $NEXT_VERSION
CHANGELOG=$(npx changelogen --from $CURRENT_VERSION --to $NEXT_VERSION)
npx changelogen --from $CURRENT_VERSION --to $NEXT_VERSION --output CHANGELOG.md
git add CHANGELOG.md
git commit --amend --no-edit --no-verify

# Force update the tag to point to the amended commit
git tag -f $NEXT_VERSION -m "$CHANGELOG"
