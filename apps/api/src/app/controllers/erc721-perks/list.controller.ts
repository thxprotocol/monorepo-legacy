import { Request, Response } from 'express';
import { query } from 'express-validator';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import ERC721PerkService from '@thxnetwork/api/services/ERC721PerkService';
import PoolService from '@thxnetwork/api/services/PoolService';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import { ERC721PerkPayment } from '@thxnetwork/api/models/ERC721PerkPayment';
import { ERC721PerkDocument } from '@thxnetwork/api/models/ERC721Perk';
import { ERC721Token, ERC721TokenDocument } from '@thxnetwork/api/models/ERC721Token';
import { ERC721Document } from '@thxnetwork/api/models/ERC721';
import ERC1155Service from '@thxnetwork/api/services/ERC1155Service';
import { ERC1155Document } from '@thxnetwork/api/models/ERC1155';
import { ERC1155TokenDocument } from '@thxnetwork/api/models/ERC1155Token';

export const validation = [query('limit').optional().isInt({ gt: 0 }), query('page').optional().isInt({ gt: 0 })];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721 Rewards']

    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const perks = await ERC721PerkService.findByPool(pool, page, limit);
    perks.results = await Promise.all(
        perks.results.map(async (perk: ERC721PerkDocument) => {
            const claims = await ClaimService.findByPerk(perk);
            let nft: ERC721Document | ERC1155Document, token: ERC721TokenDocument | ERC1155TokenDocument;

            if (perk.erc721Id) {
                nft = await ERC721Service.findById(perk.erc721Id);

                if (perk.tokenId) {
                    token = await ERC721Token.findById(perk.tokenId);
                }
            }

            if (perk.erc1155Id) {
                nft = await ERC1155Service.findById(perk.erc1155Id);

                if (perk.tokenId) {
                    token = await ERC1155Service.findTokenById(perk.tokenId);
                }
            }

            const payments = await ERC721PerkPayment.find({ perkId: perk._id });

            return {
                ...perk,
                claims,
                nft,
                token,
                payments,
            };
        }),
    );

    res.json(perks);
};

export default { controller, validation };
