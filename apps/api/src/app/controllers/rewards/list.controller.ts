import { Request, Response } from 'express';
import RewardService from '@thxnetwork/api/services/RewardService';
import WithdrawalService from '@thxnetwork/api/services/WithdrawalService';
import ClaimService from '@thxnetwork/api/services/ClaimService';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const rewards = await RewardService.findByPool(req.assetPool, Number(req.query.page), Number(req.query.limit));

    const promises = rewards.results.map(async (r, i) => {
        const rewardId = String(r.id);
        const withdrawals = await WithdrawalService.findByQuery({
            poolId: String(req.assetPool._id),
            rewardId,
        });
        const claims = await ClaimService.findByReward(r);

        rewards.results[i] = {
            claims,
            id: rewardId,
            progress: withdrawals.length,
            ...r,
        };

        return rewards;
    });

    await Promise.all(promises);

    res.json(rewards);
};

export default { controller };
