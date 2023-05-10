import { body } from 'express-validator';
import { Request, Response } from 'express';
import { OwnedNft } from 'alchemy-sdk';
import { ERC1155Token } from '@thxnetwork/api/models/ERC1155Token';
import { ERC1155 } from '@thxnetwork/api/models/ERC1155';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { ERC1155TokenState } from '@thxnetwork/api/types/TERC1155';
import { alchemy } from '@thxnetwork/api/util/alchemy';
import { ChainId, NFTVariant } from '@thxnetwork/types/enums';
import PoolService from '@thxnetwork/api/services/PoolService';
import { ERC1155Metadata } from '@thxnetwork/api/models/ERC1155Metadata';
import WalletService from '@thxnetwork/api/services/WalletService';

const validation = [
    body('contractAddress').exists(),
    body('chainId').exists().isNumeric(),
    body('name').exists().isString(),
];

const controller = async (req: Request, res: Response) => {
    const chainId = Number(req.body.chainId) as ChainId;
    const contractAddress = req.body.contractAddress;
    const wallet = await WalletService.findOneByQuery({ sub: req.auth.sub, chainId: req.body.chainId });
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

    if (!ownedNfts.length) {
        throw new NotFoundError('Could not find NFT tokens for this contract address');
    }

    const { address } = ownedNfts[0].contract;
    const erc1155 = await ERC1155.findOneAndUpdate(
        {
            sub: req.auth.sub,
            chainId,
            address,
        },
        {
            variant: NFTVariant.ERC1155,
            sub: req.auth.sub,
            chainId,
            address,
            name: req.body.name,
            properties: [
                { name: 'name', propType: 'string', description: '' },
                { name: 'description', propType: 'string', description: '' },
                { name: 'image', propType: 'image', description: '' },
                { name: 'externalUrl', propType: 'url', description: '' },
            ],
        },
        { upsert: true, new: true },
    );
    const erc1155Tokens = await Promise.all(
        ownedNfts
            .filter((nft) => nft.rawMetadata)
            .map(async ({ rawMetadata, tokenId }) => {
                try {
                    const metadata = await ERC1155Metadata.create({
                        erc1155Id: String(erc1155._id),
                        name: rawMetadata.name,
                        description: rawMetadata.description,
                        image: rawMetadata.image,
                        imageUrl: rawMetadata.image,
                        externalUrl: rawMetadata.external_url,
                    });
                    const erc1155Token = await ERC1155Token.create({
                        sub: req.auth.sub,
                        tokenId,
                        recipient: pool.address,
                        state: ERC1155TokenState.Minted,
                        erc1155Id: String(erc1155._id),
                        metadataId: String(metadata._id),
                        walletId: String(wallet._id),
                    });

                    return { ...erc1155Token.toJSON(), metadata: metadata.toJSON() };
                } catch (error) {
                    console.log(error);
                }
            }),
    );

    res.status(201).json({ erc1155, erc1155Tokens });
};

export default { controller, validation };
