import { Network, Alchemy, OwnedNft } from 'alchemy-sdk';
import { ALCHEMY_API_KEY } from '../config/secrets';
import { logger } from './logger';
import { IPFS_BASE_URL } from '@thxnetwork/api/config/secrets';

export const alchemy = new Alchemy({
    apiKey: ALCHEMY_API_KEY,
    network: Network.MATIC_MAINNET,
});

export async function getNFTsForOwner(owner: string, contractAddress: string) {
    const pageSize = 100;
    let pageKey = 0,
        pageCount = 1,
        ownedNfts: OwnedNft[] = [];

    while (pageKey < pageCount) {
        try {
            const key = String(++pageKey);
            const result = await alchemy.nft.getNftsForOwner(owner, {
                contractAddresses: [contractAddress],
                omitMetadata: false,
                pageSize,
                pageKey: key,
            });
            const totalCount = Number(result.totalCount);

            // If total is less than size there will only be 1 page, if not round up total / size
            // to get the max amount of pages
            pageCount = totalCount < pageSize ? 1 : Math.ceil(totalCount / pageSize);

            ownedNfts = ownedNfts.concat(result.ownedNfts);
        } catch (error) {
            logger.error(error);
        }
    }

    return ownedNfts;
}

export function parseIPFSImageUrl(url = 'ipfs://QmdnhWN8VjX45BfX7sJuUnwcr7HU9YcDPPLCPQhSuuyjZ3/0.png') {
    const ipfsPrefix = 'ipfs://';
    if (url.startsWith(ipfsPrefix)) {
        const ipfsPath = url.substring(ipfsPrefix.length);
        return IPFS_BASE_URL + ipfsPath;
    }
    return url;
}
