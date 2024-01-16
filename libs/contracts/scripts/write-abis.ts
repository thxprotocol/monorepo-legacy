import { contractConfig, tokenContractNames } from '../exports';
import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';

const dir = path.resolve(__dirname, '..', 'exports', 'abis');

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

rimraf.sync(path.join(dir, '*'));

for (const contractName of tokenContractNames) {
    fs.writeFileSync(
        path.resolve(dir, `${contractName}.json`),
        JSON.stringify(contractConfig('hardhat', contractName).abi, null, 2),
    );
}

console.log('Abis extracted and stored.');
