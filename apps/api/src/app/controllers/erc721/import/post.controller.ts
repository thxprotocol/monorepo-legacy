import { body } from 'express-validator';
import { Request, Response } from 'express';
import { ERC721, ERC721Token, ERC721Metadata } from '@thxnetwork/api/models';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { getNFTsForOwner } from '@thxnetwork/api/util/alchemy';
import { ChainId, ERC721TokenState, NFTVariant } from '@thxnetwork/common/enums';
import { toChecksumAddress } from 'web3-utils';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [body('contractAddress').exists(), body('chainId').exists().isNumeric()];

const controller = async (req: Request, res: Response) => {
    const chainId = Number(req.body.chainId) as ChainId;
    const contractAddress = toChecksumAddress(req.body.contractAddress);
    const pool = await PoolService.getById(req.header('X-PoolId'));

    const ownedNfts = await getNFTsForOwner(pool.safeAddress, contractAddress);
    if (!ownedNfts.length) throw new NotFoundError('Could not find NFT tokens for this contract address');

    const { address, name, symbol } = ownedNfts[0].contract;
    const erc721 = await ERC721.findOneAndUpdate(
        {
            sub: req.auth.sub,
            chainId,
            address: toChecksumAddress(address),
        },
        {
            variant: NFTVariant.ERC721,
            sub: req.auth.sub,
            chainId,
            address: toChecksumAddress(address),
            name,
            symbol,
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
                        walletId: String(pool.safe._id),
                        erc721Id: String(erc721._id),
                        recipient: pool.safeAddress,
                        state: ERC721TokenState.Minted,
                        metadataId: String(metadata._id),
                        tokenId,
                        tokenUri: tokenUri.raw,
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
