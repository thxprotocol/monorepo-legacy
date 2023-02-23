import { ImportCandidate } from 'ipfs-core-types/src/utils';
import { INFURA_IPFS_PROJECT_ID, INFURA_IPFS_PROJECT_SECRET } from '../config/secrets';
import { create } from 'ipfs-http-client';

const ipfsClient = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        Authorization: `Basic ${Buffer.from(`${INFURA_IPFS_PROJECT_ID}:${INFURA_IPFS_PROJECT_SECRET}`).toString(
            'base64',
        )}`,
    },
});

export async function add(file: Express.Multer.File) {
    return await ipfsClient.add({
        content: file.buffer,
    } as ImportCandidate);
}

export default { add };
