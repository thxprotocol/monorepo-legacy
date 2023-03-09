import { Request, Response } from 'express';
import { query } from 'express-validator';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import ERC721PerkService from '@thxnetwork/api/services/ERC721PerkService';
import PoolService from '@thxnetwork/api/services/PoolService';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import { ERC721PerkPayment } from '@thxnetwork/api/models/ERC721PerkPayment';
import { ERC721PerkDocument } from '@thxnetwork/api/models/ERC721Perk';
import { ERC721Token } from '@thxnetwork/api/models/ERC721Token';
import { ERC721Document } from '@thxnetwork/api/models/ERC721';

export const validation = [query('limit').optional().isInt({ gt: 0 }), query('page').optional().isInt({ gt: 0 })];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721 Rewards']

    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const perks = await ERC721PerkService.findByPool(pool, page, limit);
    perks.results = await Promise.all(
        perks.results.map(async (perk: ERC721PerkDocument) => {
            const claims = await ClaimService.findByReward(perk);
            const erc721 = await ERC721Service.findById(perk.erc721Id);
            const payments = await ERC721PerkPayment.find({ perkId: perk._id });
            let erc721Token: ERC721Document;
            if (perk.erc721tokenId) {
                erc721Token = await ERC721Token.findById(perk.erc721tokenId);
            }
            return {
                claims,
                payments,
                erc721,
                ...perk,
                erc721Token: erc721Token ? erc721Token.toJSON() : undefined,
            };
        }),
    );

    res.json(perks);
};

export default { controller, validation };
