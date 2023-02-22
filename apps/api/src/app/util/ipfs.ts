import { INFURA_IPFS_PROJECT_ID, INFURA_IPFS_PROJECT_SECRET } from '../config/secrets';
import FormData from 'form-data';

const ipfsClient = async () => {
    const { create } = await import('ipfs-http-client');
    return await create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
            Authorization: `Basic ${Buffer.from(`${INFURA_IPFS_PROJECT_ID}:${INFURA_IPFS_PROJECT_SECRET}`).toString(
                'base64',
            )}`,
        },
    });
};

export async function add(file) {
    const client = await ipfsClient();
    return client.add(file, { progress: () => console.log('progress') });
}

export async function get(hash: string) {
    return '';
}

export default { add, get };
