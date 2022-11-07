#!/bin/bash
# Exit on any errors.
set -e

BASE_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")/.." ; pwd -P )
VERSION=`echo $(node -e "console.log(require('$BASE_DIR/package.json').version);")`

# Remove compiled artifacts so they are built fresh.
rm -rf $BASE_DIR/artifacts

cd $BASE_DIR

npx hardhat compile

BUMP=${1:-patch} 
if [ "$BUMP" != "none" ]
then
    npm version --no-git-tag --silent $BUMP
fi

# # Store latest version for hardhat network.
npx hardhat deploy --network hardhat --export exports/hardhat/latest.json

# Deploy and export for all networks.
for NETWORK in mumbaidev maticdev mumbai matic
do
    echo ""
    echo "Deploying to $NETWORK:"
    npx hardhat deploy --network $NETWORK --export $BASE_DIR/exports/$NETWORK/$VERSION.json
done

# Exports the latest versions of abis for direct imports.
npx nx run contracts:build-abi
npx nx run contracts:build-bytecodes

git add . 
git commit --allow-empty -m "Bumps version to $VERSION for Contracts"
git push origin