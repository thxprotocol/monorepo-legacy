import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body } from 'express-validator';
import ReferralRewardClaimService from '@thxnetwork/api/services/ReferralRewardClaimService';
import PointBalanceService from '@thxnetwork/api/services/PointBalanceService';
import ReferralRewardService from '@thxnetwork/api/services/ReferralRewardService';
import PoolService from '@thxnetwork/api/services/PoolService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const validation = [body('claimUuids').exists().isArray()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards Referral Claims']
    const claims = await Promise.all(
        req.body.claimUuids.map(async (uuid: string) => {
            let claim = await ReferralRewardClaimService.findByUUID(uuid);
            if (!claim) throw new NotFoundError('Could not find the reward claim for this id');

            const account = await AccountProxy.getById(claim.sub);

            if (!claim.isApproved) {
                claim.isApproved = true;
                claim = await ReferralRewardClaimService.update(claim, claim);
                const reward = await ReferralRewardService.get(claim.referralRewardId);
                const pool = await PoolService.getById(reward.poolId);

                // Transfer ReferralReward.amount points to the ReferralRewardClaim.sub
                await PointBalanceService.add(pool, claim.sub, reward.amount);
            }

            return {
                ...claim.toJSON(),
                email: account.email,
                firstName: account.firstName,
                lastName: account.lastName,
            };
        }),
    );
    return res.json(claims);
};

export default { controller, validation };
