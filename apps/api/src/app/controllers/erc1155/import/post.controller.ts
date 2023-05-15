import { body } from 'express-validator';
import { Request, Response } from 'express';
import { OwnedNft } from 'alchemy-sdk';
import { ERC1155Token } from '@thxnetwork/api/models/ERC1155Token';
import { ERC1155 } from '@thxnetwork/api/models/ERC1155';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { ERC1155TokenState } from '@thxnetwork/types/interfaces';
import { alchemy } from '@thxnetwork/api/util/alchemy';
import { ChainId, NFTVariant } from '@thxnetwork/types/enums';
import { logger } from '@thxnetwork/api/util/logger';
import { ERC1155Metadata } from '@thxnetwork/api/models/ERC1155Metadata';
import PoolService from '@thxnetwork/api/services/PoolService';
import WalletService from '@thxnetwork/api/services/WalletService';

const validation = [
    body('contractAddress').exists().isString(),
    body('chainId').exists().isNumeric(),
    body('name').exists().isString(),
];

const controller = async (req: Request, res: Response) => {
    const chainId = Number(req.body.chainId) as ChainId;
    const contractAddress = req.body.contractAddress;
    const wallet = await WalletService.findOneByQuery({ sub: req.auth.sub, chainId });
    const pool = await PoolService.getById(req.header('X-PoolId'));

    const pageSize = 100;
    let pageKey = 0,
        pageCount = 1,
        ownedNfts: OwnedNft[] = [];

    while (pageKey < pageCount) {
        try {
            const key = String(++pageKey);
            const result = await alchemy.nft.getNftsForOwner(pool.address, {
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
            console.log(error);
        }
    }

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
        },
        { upsert: true, new: true },
    );
    const erc1155Tokens = await Promise.all(
        ownedNfts
            .filter((nft) => nft.rawMetadata)
            .map(async ({ rawMetadata, tokenId, tokenUri }) => {
                try {
                    const erc1155Id = String(erc1155._id);
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
                            image: rawMetadata.image,
                            imageUrl: rawMetadata.image,
                            externalUrl: rawMetadata.external_url,
                        },
                        { upsert: true, new: true },
                    );
                    const erc1155Token = await ERC1155Token.findOneAndUpdate(
                        {
                            erc1155Id,
                            tokenId,
                            sub: req.auth.sub,
                            recipient: pool.address,
                        },
                        {
                            erc1155Id,
                            tokenId,
                            tokenUri: tokenUri.raw,
                            sub: req.auth.sub,
                            recipient: pool.address,
                            state: ERC1155TokenState.Minted,
                            metadataId: String(metadata._id),
                            walletId: String(wallet._id),
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
