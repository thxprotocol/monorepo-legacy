import { contractConfig, contractNames, diamondAbi, diamondVariants } from '../src/exports';
import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';

const dir = path.resolve(__dirname, '..', 'exports', 'abis');

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}
rimraf.sync(path.join(dir, '*'));

for (const contractName of contractNames) {
    const config = contractConfig('hardhat', contractName);
    fs.writeFileSync(path.resolve(dir, `${contractName}.json`), JSON.stringify(config.abi, null, 2));
}

const config = contractConfig('hardhat', 'LimitedSupplyToken');
fs.writeFileSync(path.resolve(dir, `ERC20.json`), JSON.stringify(config.abi, null, 2));

for (const diamondVariant of diamondVariants) {
    const abi = diamondAbi('hardhat', diamondVariant);
    fs.writeFileSync(path.resolve(dir, `${diamondVariant}Diamond.json`), JSON.stringify(abi, null, 2));
}

console.log('Abis extracted and stored.');
