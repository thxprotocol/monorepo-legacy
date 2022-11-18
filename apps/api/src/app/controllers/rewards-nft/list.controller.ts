import { Request, Response } from 'express';
import RewardService from '@thxnetwork/api/services/RewardService';
import WithdrawalService from '@thxnetwork/api/services/WithdrawalService';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import RewardNftService from '@thxnetwork/api/services/RewardNftService';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsNft']
    const rewards = await RewardNftService.findByPool(req.assetPool, Number(req.query.page), Number(req.query.limit));

    const promises = rewards.results.map(async (r, i) => {
        const rewardBaseId = String(r.rewardBaseId);
        const withdrawals = await WithdrawalService.findByQuery({
            poolId: String(req.assetPool._id),
            rewardId: rewardBaseId,
        });
        const claims = await ClaimService.findByReward(r);

        rewards.results[i] = {
            claims,
            id: rewardBaseId,
            progress: withdrawals.length,
            ...r,
        };

        return rewards;
    });

    await Promise.all(promises);

    res.json(rewards);
};

export default { controller };
