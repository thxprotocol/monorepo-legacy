import { Request, Response } from 'express';
import { ERC1155TokenDocument } from '@thxnetwork/api/models/ERC1155Token';
import { query } from 'express-validator';
import { BadRequestError } from '@thxnetwork/api/util/errors';
import SafeService from '@thxnetwork/api/services/SafeService';
import ERC1155Service from '@thxnetwork/api/services/ERC1155Service';

const validation = [query('walletId').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    const wallet = await SafeService.findById(req.query.walletId as string);
    if (!wallet) throw new BadRequestError('Wallet not found');

    const tokens = await ERC1155Service.findTokensByWallet(wallet);
    const result = await Promise.all(
        tokens.map(async (token: ERC1155TokenDocument) => {
            const erc1155 = await ERC1155Service.findById(token.erc1155Id);
            if (!erc1155 || erc1155.chainId !== wallet.chainId) return;

            const metadata = await ERC1155Service.findMetadataById(token.metadataId);
            if (!metadata) return;

            return Object.assign(token.toJSON() as TERC1155Token, { metadata, nft: erc1155 });
        }),
    );

    res.json(
        result.reverse().filter((token: TERC1155Token & { nft: TERC1155 }) => {
            return token && wallet.chainId === token.nft.chainId;
        }),
    );
};

export default { controller, validation };
