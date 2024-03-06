import { Request, Response } from 'express';
import { query } from 'express-validator';
import { ERC721Token, ERC721TokenDocument, ERC721Metadata } from '@thxnetwork/api/models';
import { BadRequestError } from '@thxnetwork/api/util/errors';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [query('walletId').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    const wallet = await SafeService.findById(req.query.walletId as string);
    if (!wallet) throw new BadRequestError('Wallet not found');

    const tokens = await ERC721Token.find({ walletId: wallet.id });
    const result = await Promise.all(
        tokens.map(async (token: ERC721TokenDocument) => {
            const erc721 = await ERC721Service.findById(token.erc721Id);
            if (!erc721 || erc721.chainId !== wallet.chainId) return;

            const metadata = await ERC721Metadata.findById(token.metadataId);
            if (!metadata) return;

            return Object.assign(token.toJSON() as TERC721Token, { metadata, tokenUri: token.tokenUri, nft: erc721 });
        }),
    );

    res.json(
        result.reverse().filter((token: TERC721Token & { nft: TERC721 }) => {
            return token && wallet.chainId === token.nft.chainId;
        }),
    );
};

export default { controller, validation };
