import { Request, Response } from 'express';
import { ERC721TokenDocument } from '@thxnetwork/api/models/ERC721Token';
import type { TERC721, TERC721Token } from '@thxnetwork/types/interfaces';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import { Wallet } from '@thxnetwork/api/services/WalletService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { query } from 'express-validator';

const validation = [query('chainId').exists().isNumeric(), query('recipient').exists().isString()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721']
    const chainId = Number(req.query.chainId);
    const wallet = await Wallet.findOne({ sub: req.auth.sub, chainId });
    if (!wallet) throw new NotFoundError('Could not find the wallet for the user');

    const tokens = await ERC721Service.findTokensByWallet(wallet);
    const result = await Promise.all(
        tokens.map(async (token: ERC721TokenDocument) => {
            const erc721 = await ERC721Service.findById(token.erc721Id);
            if (!erc721 || erc721.chainId !== chainId) return;

            const metadata = await ERC721Service.findMetadataById(token.metadataId);
            if (!metadata) return;

            return Object.assign(token.toJSON() as TERC721Token, { metadata, tokenUri: token.tokenUri, nft: erc721 });
        }),
    );

    res.json(
        result.reverse().filter((token: TERC721Token & { nft: TERC721 }) => {
            return (
                token &&
                chainId === token.nft.chainId &&
                (req.query.recipient ? req.query.recipient === token.recipient : true)
            );
        }),
    );
};

export default { controller, validation };
