import { Request, Response } from 'express';
import { ERC1155Token, ERC1155TokenDocument } from '@thxnetwork/api/models/ERC1155Token';
import { query } from 'express-validator';
import SafeService from '@thxnetwork/api/services/SafeService';
import type { TERC1155, TERC1155Token } from '@thxnetwork/types/interfaces';
import ERC1155Service from '@thxnetwork/api/services/ERC1155Service';

const validation = [query('chainId').exists().isNumeric(), query('recipient').optional().isString()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC1155']
    const chainId = Number(req.query.chainId);
    const wallet = await SafeService.findPrimary(req.auth.sub, chainId);
    const tokens = req.query.recipient
        ? await ERC1155Token.find({ recipient: req.query.recipient })
        : await ERC1155Service.findTokensByWallet(wallet);
    const result = await Promise.all(
        tokens.map(async (token: ERC1155TokenDocument) => {
            const erc1155 = await ERC1155Service.findById(token.erc1155Id);
            if (!erc1155 || erc1155.chainId !== chainId) return;

            const metadata = await ERC1155Service.findMetadataById(token.metadataId);
            if (!metadata) return;

            return Object.assign(token.toJSON() as TERC1155Token, { metadata, nft: erc1155 });
        }),
    );

    res.json(
        result.reverse().filter((token: TERC1155Token & { nft: TERC1155 }) => {
            return token && chainId === token.nft.chainId;
        }),
    );
};

export default { controller, validation };
