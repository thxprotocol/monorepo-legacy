import { Request, Response } from 'express';
// import WithdrawalService from '@thxnetwork/api/services/WithdrawalService';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import ShopifyPerkService from '@thxnetwork/api/services/ShopifyPerkService';
import { query } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import { ShopifyPerkPayment } from '@thxnetwork/api/models/ShopifyPerkPayment';

export const validation = [query('limit').optional().isInt({ gt: 0 }), query('page').optional().isInt({ gt: 0 })];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsShopify']
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const rewards = await ShopifyPerkService.findByPool(pool, page, limit);
    rewards.results = await Promise.all(
        rewards.results.map(async (r) => {
            const claims = await ClaimService.findByPerk(r);
            const payments = await ShopifyPerkPayment.find({ perkId: r._id });

            return {
                ...r,
                claims,
                payments,
            };
        }),
    );

    res.json(rewards);
};

export default { controller, validation };
