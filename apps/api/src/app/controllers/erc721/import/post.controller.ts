import { body } from 'express-validator';
import { Request, Response } from 'express';
import { OwnedNft } from 'alchemy-sdk';
import { ERC721Token } from '@thxnetwork/api/models/ERC721Token';
import { ERC721 } from '@thxnetwork/api/models/ERC721';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { ERC721TokenState } from '@thxnetwork/types/interfaces';
import { alchemy } from '@thxnetwork/api/util/alchemy';
import { ChainId, NFTVariant } from '@thxnetwork/types/enums';
import PoolService from '@thxnetwork/api/services/PoolService';
import { toChecksumAddress } from 'web3-utils';
import { ERC721Metadata } from '@thxnetwork/api/models/ERC721Metadata';

const validation = [body('contractAddress').exists(), body('chainId').exists().isNumeric()];

const controller = async (req: Request, res: Response) => {
    const chainId = Number(req.body.chainId) as ChainId;
    const contractAddress = req.body.contractAddress;
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

    const { address, name, symbol } = ownedNfts[0].contract;
    const erc721 = await ERC721.findOneAndUpdate(
        {
            sub: req.auth.sub,
            chainId,
            address,
        },
        {
            variant: NFTVariant.ERC721,
            sub: req.auth.sub,
            chainId,
            address: toChecksumAddress(address, chainId),
            name,
            symbol,
            properties: [
                { name: 'name', propType: 'string', description: '' },
                { name: 'description', propType: 'string', description: '' },
                { name: 'image', propType: 'image', description: '' },
                { name: 'externalUrl', propType: 'url', description: '' },
            ],
            archived: false,
        },
        { upsert: true, new: true },
    );
    const erc721Tokens = await Promise.all(
        ownedNfts
            .filter((nft) => nft.rawMetadata)
            .map(async ({ rawMetadata, tokenId, tokenUri }) => {
                try {
                    const erc721Id = String(erc721._id);
                    const metadata = await ERC721Metadata.create({
                        erc721Id,
                        name: rawMetadata.name,
                        description: rawMetadata.description,
                        image: rawMetadata.image,
                        imageUrl: rawMetadata.image,
                        externalUrl: rawMetadata.external_url,
                    });
                    const erc721Token = await ERC721Token.create({
                        erc721Id: String(erc721._id),
                        recipient: pool.address,
                        state: ERC721TokenState.Minted,
                        metadataId: String(metadata._id),
                        tokenId,
                        tokenUri,
                    });

                    return { ...erc721Token.toJSON(), metadata: metadata.toJSON() };
                } catch (error) {
                    console.log(error);
                }
            }),
    );

    res.status(201).json({ erc721, erc721Tokens });
};

export default { controller, validation };
