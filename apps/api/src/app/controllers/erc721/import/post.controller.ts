import { body } from 'express-validator';
import { Request, Response } from 'express';
import { ERC721, ERC721Token, ERC721Metadata, Wallet } from '@thxnetwork/api/models';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { getNFTsForOwner } from '@thxnetwork/api/util/alchemy';
import { ChainId, ERC721TokenState, NFTVariant } from '@thxnetwork/common/enums';
import { toChecksumAddress } from 'web3-utils';

const validation = [
    body('address').isEthereumAddress(),
    body('contractAddress').exists(),
    body('chainId').exists().isNumeric(),
];

const controller = async (req: Request, res: Response) => {
    const chainId = Number(req.body.chainId) as ChainId;
    const contractAddress = toChecksumAddress(req.body.contractAddress);
    const safeAddress = toChecksumAddress(req.body.address);
    const ownedNfts = await getNFTsForOwner(safeAddress, contractAddress);
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
            .map(async ({ media, rawMetadata, tokenId, tokenUri }) => {
                try {
                    const image = media && media.length ? media[0].gateway : rawMetadata.image;
                    const metadata = await ERC721Metadata.findOneAndUpdate(
                        {
                            erc721Id: erc721.id,
                            externalUrl: rawMetadata.external_url,
                        },
                        {
                            erc721Id: erc721.id,
                            name: rawMetadata.name,
                            description: rawMetadata.description,
                            image,
                            imageUrl: image,
                            externalUrl: rawMetadata.external_url,
                        },
                        { upsert: true, new: true },
                    );
                    const safe = await Wallet.findOne({
                        address: req.body.address,
                        chainId: req.body.chainId,
                    });
                    const token = await ERC721Token.findOneAndUpdate(
                        { tokenId, walletId: safe.id, erc721Id: erc721.id },
                        {
                            walletId: safe.id,
                            erc721Id: erc721.id,
                            recipient: safe.address,
                            metadataId: metadata.id,
                            tokenUri: tokenUri.raw,
                            tokenId,
                            state: ERC721TokenState.Minted,
                        },
                        { upsert: true, new: true },
                    );

                    return { ...token.toJSON(), metadata: metadata.toJSON() };
                } catch (error) {
                    console.log(error);
                }
            }),
    );

    res.status(201).json({ erc721, erc721Tokens });
};

export { controller, validation };
