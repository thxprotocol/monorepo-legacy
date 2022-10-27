#!/usr/bin/env bash

npx nx lint api
cd ./libs/contracts && npx hardhat node > /dev/null 2>&1 & 
bash ./scripts/wait-for-it.sh localhost:8545 --strict --timeout=300 -- npx nx test api