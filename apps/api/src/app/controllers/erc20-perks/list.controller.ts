import { Request, Response } from 'express';
// import WithdrawalService from '@thxnetwork/api/services/WithdrawalService';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import RewardCoinService from '@thxnetwork/api/services/RewardCoinService';
import { query } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import { RewardCoinPayment } from '@thxnetwork/api/models/RewardCoinPayment';

export const validation = [query('limit').optional().isInt({ gt: 0 }), query('page').optional().isInt({ gt: 0 })];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsToken']
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const rewards = await RewardCoinService.findByPool(pool, page, limit);
    rewards.results = await Promise.all(
        rewards.results.map(async (r) => {
            const claims = await ClaimService.findByPerk(r);
            const erc20 = await ERC20Service.getById(r.erc20Id);
            const payments = await RewardCoinPayment.find({ rewardId: r._id });

            return {
                ...r,
                erc20,
                claims,
                payments,
            };
        }),
    );

    res.json(rewards);
};

export default { controller, validation };
