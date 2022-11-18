import { Request, Response } from 'express';
import WithdrawalService from '@thxnetwork/api/services/WithdrawalService';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import RewardTokenService from '@thxnetwork/api/services/RewardTokenService';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const rewards = await RewardTokenService.findByPool(req.assetPool, Number(req.query.page), Number(req.query.limit));

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
