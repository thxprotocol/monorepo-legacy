import { contractConfig, contractNames, tokenContractNames, diamondAbi, diamondVariants } from '../exports';
import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';

const dir = path.resolve(__dirname, '..', 'exports', 'abis');
const artifactsDir = path.resolve(__dirname, '..', 'artifacts', 'diamond-2', 'contracts', 'Diamond.sol');

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

rimraf.sync(path.join(dir, '*'));

for (const contractName of contractNames) {
    const config = contractConfig('hardhat', contractName);
    if (config) {
        fs.writeFileSync(path.resolve(dir, `${contractName}.json`), JSON.stringify(config.abi, null, 2));
    }
}

for (const contractName of tokenContractNames) {
    fs.writeFileSync(
        path.resolve(dir, `${contractName}.json`),
        JSON.stringify(contractConfig('hardhat', contractName).abi, null, 2),
    );
}

for (const diamondVariant of diamondVariants) {
    const abi = diamondAbi('hardhat', diamondVariant);
    fs.writeFileSync(path.resolve(dir, `${diamondVariant}Diamond.json`), JSON.stringify(abi, null, 2));
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const artifact = require(artifactsDir + '/Diamond.json');
fs.writeFileSync(path.resolve(dir, 'Diamond.json'), JSON.stringify(artifact.abi, null, 2));

console.log('Abis extracted and stored.');
