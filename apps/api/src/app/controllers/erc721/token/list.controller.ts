import { Request, Response } from 'express';
import { ERC721Token, ERC721TokenDocument } from '@thxnetwork/api/models/ERC721Token';
import { query } from 'express-validator';
import { TERC721, TERC721Token } from '@thxnetwork/types/interfaces';
import { ERC721Metadata } from '@thxnetwork/api/models/ERC721Metadata';
import { BadRequestError } from '@thxnetwork/api/util/errors';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [query('walletId').optional().isMongoId(), query('recipient').optional().isEthereumAddress()];

export const controller = async (req: Request, res: Response) => {
    const wallet = await SafeService.findById(req.query.walletId as string);
    if (!wallet) throw new BadRequestError('Wallet not found');

    // We check for the recipient search param here which is used to fetch tokens for a safe in the import flow
    const tokens = req.query.recipient
        ? await ERC721Token.find({ recipient: req.query.recipient })
        : await ERC721Token.find({ walletId: String(wallet._id) });
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
