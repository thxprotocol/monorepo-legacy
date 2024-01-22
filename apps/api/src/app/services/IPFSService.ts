import { ImportCandidate } from 'ipfs-core-types/src/utils';
import { API_URL, INFURA_IPFS_PROJECT_ID, INFURA_IPFS_PROJECT_SECRET } from '../config/secrets';
import { create, urlSource } from 'ipfs-http-client';
import { ERC721Document } from '../models/ERC721';
import { ERC1155Document } from '../models/ERC1155';
import { NFTVariant } from '@thxnetwork/common/lib/types';

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

async function getTokenURI(nft: ERC721Document | ERC1155Document, metadataId: string, tokenId?: string) {
    const tokenUri = {
        [NFTVariant.ERC721]: `${API_URL}/v1/metadata/${metadataId}`,
        [NFTVariant.ERC1155]: `${API_URL}/v1/erc1155/metadata/${metadataId}/${tokenId}`,
    };
    const result = await addImageUrl(tokenUri[nft.variant]);
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
