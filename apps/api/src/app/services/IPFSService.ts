import { ImportCandidate } from 'ipfs-core-types/src/utils';
import { API_URL, INFURA_IPFS_PROJECT_ID, INFURA_IPFS_PROJECT_SECRET } from '../config/secrets';
import { create, urlSource } from 'ipfs-http-client';
import AccountProxy from '../proxies/AccountProxy';
import { AccountPlanType } from '@thxnetwork/types/enums';
import { ERC721Document } from '../models/ERC721';
import { ERC1155Document } from '../models/ERC1155';

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

async function getTokenURI(nft: ERC721Document | ERC1155Document, metadataId: string) {
    const account = await AccountProxy.getById(nft.sub);
    if (account.plan !== AccountPlanType.Premium) return metadataId;

    const result = await addImageUrl(`${API_URL}/v1/metadata/${metadataId}`);
    return result.cid.toString();
}

export async function add(file: Express.Multer.File) {
    return await ipfsClient.add({
        content: file.buffer,
    } as ImportCandidate);
}

export async function addImageUrl(url: string) {
    return await ipfsClient.add(urlSource(url) as ImportCandidate);
}

export default { add, addImageUrl, getTokenURI };
