#!/bin/bash
# Exit on any errors.
set -e

BASE_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")/.." ; pwd -P )
VERSION=`echo $(node -e "console.log(require('$BASE_DIR/package.json').version);")`

cd $BASE_DIR

npm i

BUMP=${1:-patch} 
if [ "$BUMP" != "none" ]
then
    npm version --no-git-tag --silent $BUMP
fi

VERSION=`echo $(node -e "console.log(require('$BASE_DIR/package.json').version);")`

$BASE_DIR/scripts/deploy-export.sh

git add . 
git commit --allow-empty -m"Publish: Deployed and exported version $VERSION"

TAG=v$VERSION
git tag $TAG
git push 
git push origin $TAG

npm publish
