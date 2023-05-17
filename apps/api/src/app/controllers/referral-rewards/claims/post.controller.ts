import { Request, Response } from 'express';
import { body, header } from 'express-validator';
import ReferralRewardClaimService from '@thxnetwork/api/services/ReferralRewardClaimService';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Wallet } from '@thxnetwork/api/models/Wallet';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [body('sub').exists().isMongoId(), header('X-PoolId').exists().isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards Referral Claims']
    const reward = await ReferralReward.findOne({ uuid: req.params.uuid });
    if (!reward) throw new NotFoundError('Could not find the referral reward');

    const pool = await PoolService.getById(req.header('X-PoolId'));
    const wallet = await Wallet.findOne({ sub: req.body.sub, chainId: pool.chainId });
    const claim = await ReferralRewardClaimService.create({
        sub: req.body.sub,
        walletId: wallet._id,
        referralRewardId: reward._id,
        isApproved: false,
        poolId: req.header('X-PoolId'),
        amount: reward.amount ? reward.amount.toString() : '0',
    });

    return res.status(201).json(claim);
};

export default { controller, validation };
