import { INFURA_IPFS_PROJECT_ID, INFURA_IPFS_PROJECT_SECRET } from '../config/secrets';
import { create, urlSource } from 'ipfs-http-client';

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

export async function add(url: string) {
    return await ipfsClient.add(urlSource(url));
}

export default { add };
