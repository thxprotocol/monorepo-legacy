import { Network, Alchemy, OwnedNft } from 'alchemy-sdk';
import { ALCHEMY_API_KEY } from '../config/secrets';
import { logger } from './logger';

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
