import { tokenContractNames } from '../exports';
import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';
import { Artifact } from 'hardhat/types';
import { deployments } from 'hardhat';

const dir = path.resolve(__dirname, '..', 'exports', 'bytecodes');

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}
rimraf.sync(path.join(dir, '*'));

for (const contractName of tokenContractNames) {
    deployments.getArtifact(contractName).then((artifact: Artifact) => {
        fs.writeFileSync(
            path.resolve(dir, `${contractName}.json`),
            JSON.stringify({ bytecode: artifact.bytecode }, null, 2),
        );
    });
}

console.log('Bytecodes extracted and stored.');
