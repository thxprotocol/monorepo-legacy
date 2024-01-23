import { Request, Response } from 'express';
import { body } from 'express-validator';
import { getNFTsForOwner, parseIPFSImageUrl } from '@thxnetwork/api/util/alchemy';

export const validation = [body('address').exists().isString(), body('contractAddress').exists().isString()];

export const controller = async (req: Request, res: Response) => {
    const ownedNFTs = await getNFTsForOwner(req.body.address, req.body.contractAddress);
    res.status(200).json(
        ownedNFTs.map((nft) => {
            return {
                balance: nft.balance,
                name: nft.rawMetadata.name,
                description: nft.rawMetadata.description,
                tokenId: nft.tokenId,
                tokenUri: nft.tokenUri.raw,
                image: parseIPFSImageUrl(nft.media[0].thumbnail),
            };
        }),
    );
};
export default { controller, validation };
