import { body } from 'express-validator';
import { Request, Response } from 'express';
import { ERC1155Token } from '@thxnetwork/api/models/ERC1155Token';
import { ERC1155 } from '@thxnetwork/api/models/ERC1155';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { ERC1155TokenState } from '@thxnetwork/common/enums';
import { getNFTsForOwner, parseIPFSImageUrl } from '@thxnetwork/api/util/alchemy';
import { ChainId, NFTVariant } from '@thxnetwork/common/enums';
import { logger } from '@thxnetwork/api/util/logger';
import { ERC1155Metadata } from '@thxnetwork/api/models/ERC1155Metadata';
import PoolService from '@thxnetwork/api/services/PoolService';
import { toChecksumAddress } from 'web3-utils';

const validation = [body('contractAddress').exists().isString(), body('chainId').exists().isNumeric()];

const controller = async (req: Request, res: Response) => {
    const chainId = Number(req.body.chainId) as ChainId;
    const contractAddress = toChecksumAddress(req.body.contractAddress);
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const ownedNfts = await getNFTsForOwner(pool.safeAddress, contractAddress);
    if (!ownedNfts.length) throw new NotFoundError('Could not find NFT tokens for this contract address');

    let erc1155 = await ERC1155.findOne({
        sub: req.auth.sub,
        chainId,
        address: contractAddress,
    });

    // If erc1155 already exists check if it is owned by the authenticated user
    if (erc1155 && erc1155.sub !== req.auth.sub) {
        throw new ForbiddenError('This is not your contract.');
    }

    // If erc1155 is owned or not existing continue with update or upsert
    erc1155 = await ERC1155.findOneAndUpdate(
        {
            chainId,
            sub: req.auth.sub,
            address: contractAddress,
        },
        {
            chainId,
            sub: req.auth.sub,
            address: contractAddress,
            variant: NFTVariant.ERC1155,
            name: req.body.name,
            archived: false,
            baseURL: '',
        },
        { upsert: true, new: true },
    );
    const erc1155Tokens = await Promise.all(
        ownedNfts
            .filter((nft) => nft.rawMetadata)
            .map(async ({ rawMetadata, tokenId, tokenUri }) => {
                try {
                    const erc1155Id = String(erc1155._id);
                    const imageUrl = parseIPFSImageUrl(rawMetadata.image || rawMetadata.image_data);
                    const metadata = await ERC1155Metadata.findOneAndUpdate(
                        {
                            erc1155Id,
                            tokenId,
                        },
                        {
                            erc1155Id,
                            tokenId,
                            name: rawMetadata.name,
                            description: rawMetadata.description,
                            imageUrl,
                            image: imageUrl,
                            externalUrl: rawMetadata.external_url,
                        },
                        { upsert: true, new: true },
                    );
                    const walletId = String(pool.safe._id);
                    const erc1155Token = await ERC1155Token.findOneAndUpdate(
                        {
                            erc1155Id,
                            tokenId,
                            sub: req.auth.sub,
                            recipient: pool.safeAddress,
                        },
                        {
                            erc1155Id,
                            tokenId,
                            walletId,
                            tokenUri: tokenUri.raw,
                            sub: req.auth.sub,
                            recipient: pool.safeAddress,
                            state: ERC1155TokenState.Minted,
                            metadataId: String(metadata._id),
                        },
                        { upsert: true, new: true },
                    );

                    return { ...erc1155Token.toJSON(), metadata: metadata.toJSON() };
                } catch (error) {
                    logger.error(error);
                }
            }),
    );

    res.status(201).json({ erc1155, erc1155Tokens });
};

export default { controller, validation };
