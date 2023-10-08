import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body } from 'express-validator';
import { ReferralRewardClaim } from '@thxnetwork/api/models/ReferralRewardClaim';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import PointBalanceService from '@thxnetwork/api/services/PointBalanceService';
import PoolService from '@thxnetwork/api/services/PoolService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import MailService from '@thxnetwork/api/services/MailService';
import WalletService from '@thxnetwork/api/services/WalletService';

const validation = [body('claimUuids').exists().isArray()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards Referral Claims']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const claims = await Promise.all(
        req.body.claimUuids.map(async (uuid: string) => {
            let claim = await ReferralRewardClaim.findOne({ uuid });
            if (!claim) throw new NotFoundError('Could not find the reward claim for this uuid');

            const account = await AccountProxy.getById(claim.sub);
            const wallet = await WalletService.findPrimary(claim.sub, pool.chainId);

            if (!claim.isApproved) {
                claim = await ReferralRewardClaim.findByIdAndUpdate(claim._id, { isApproved: true }, { new: true });
                const quest = await ReferralReward.findById(claim.referralRewardId);
                const pool = await PoolService.getById(quest.poolId);

                // Transfer ReferralReward.amount points to the ReferralRewardClaim.sub
                await PointBalanceService.add(pool, wallet._id, quest.amount);

                await MailService.send(
                    account.email,
                    'Status: Referral Approved',
                    `Congratulations! Your referral has been approved and your balance has been increased with <strong>${quest.amount} points</strong>.`,
                );
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
