import { Request, Response } from 'express';
import WithdrawalService from '@thxnetwork/api/services/WithdrawalService';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import ERC20RewardService from '@thxnetwork/api/services/ERC20RewardService';
import { query } from 'express-validator';

export const validation = [query('limit').optional().isInt({ gt: 0 }), query('page').optional().isInt({ gt: 0 })];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsToken']
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;
    const rewards = await ERC20RewardService.findByPool(req.assetPool, page, limit);
    const promises = rewards.results.map(async (r, i) => {
        const withdrawals = await WithdrawalService.findByQuery({
            poolId: String(req.assetPool._id),
            rewardId: r._id,
        });
        const claims = await ClaimService.findByReward(r);

        rewards.results[i] = {
            claims,
            progress: withdrawals.length,
            ...r,
        };

        return rewards;
    });

    await Promise.all(promises);

    res.json(rewards);
};

export default { controller, validation };
