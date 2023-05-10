import { Request, Response } from 'express';
import { ERC1155TokenDocument } from '@thxnetwork/api/models/ERC1155Token';
import type { TERC1155, TERC1155Token } from '@thxnetwork/api/types/TERC1155';
import ERC1155Service from '@thxnetwork/api/services/ERC1155Service';
import { query } from 'express-validator';
import { Wallet } from '@thxnetwork/api/services/WalletService';
import { NotFoundError } from '@thxnetwork/api/util/errors';

const validation = [query('chainId').exists().isNumeric()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC1155']

    const chainId = Number(req.query.chainId);
    const wallet = await Wallet.findOne({ sub: req.auth.sub, chainId });
    if (!wallet) throw new NotFoundError('Could not find the wallet for the user');

    const tokens = await ERC1155Service.findTokensByWallet(wallet);
    const result = await Promise.all(
        tokens.map(async (token: ERC1155TokenDocument) => {
            const erc1155 = await ERC1155Service.findById(token.erc1155Id);
            if (!erc1155 || erc1155.chainId !== chainId) return;

            const metadata = await ERC1155Service.findMetadataById(token.metadataId);
            if (!metadata) return;

            const tokenUri = token.tokenId ? erc1155.baseURL.replace('{id}', String(token.tokenId)) : '';

            return Object.assign(token.toJSON() as TERC1155Token, { metadata, tokenUri, nft: erc1155 });
        }),
    );

    res.json(
        result.reverse().filter((token: TERC1155Token & { nft: TERC1155 }) => {
            return token && chainId === token.nft.chainId;
        }),
    );
};

export default { controller, validation };
