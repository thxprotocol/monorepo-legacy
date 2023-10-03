import DailyRewardClaimService, { ONE_DAY_MS } from '@thxnetwork/api/services/DailyRewardClaimService';
import { DailyReward } from '@thxnetwork/api/models/DailyReward';
import { BadRequestError, NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { DailyRewardClaimState } from '@thxnetwork/types/enums/DailyRewardClaimState';
import { DailyRewardClaim } from '@thxnetwork/api/models/DailyRewardClaims';
import { isAddress, toChecksumAddress } from 'web3-utils';
import { getWalletForAddress, getWalletForCode } from '../milestones/claim/post.controller';
import { WalletDocument } from '@thxnetwork/api/models/Wallet';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';

const validation = [
    param('token').isUUID(4),
    body('code').optional().isUUID(4),
    body('address')
        .optional()
        .custom((address) => isAddress(address))
        .customSanitizer((address) => toChecksumAddress(address)),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const reward = await DailyReward.findOne({ uuid: req.params.token });
    if (!reward) throw new NotFoundError('Could not find a daily reward for this token');

    const pool = await AssetPool.findById(reward.poolId);
    if (!pool) throw new NotFoundError('Could not find a campaign pool for this reward.');

    if (!req.body.code && !req.body.address) {
        throw new BadRequestError('This request requires either a wallet code or address');
    }

    const wallet: WalletDocument = req.body.code
        ? await getWalletForCode(pool, req.body.code)
        : await getWalletForAddress(pool, req.body.address);

    // Should only create one when there is none available within the timeframe
    let claim = await DailyRewardClaim.findOne({
        dailyRewardId: reward._id,
        walletId: wallet._id,
        createdAt: { $gt: new Date(Date.now() - ONE_DAY_MS) }, // Greater than now - 24h
    });

    if (!claim) {
        const claims = await DailyRewardClaim.find({
            dailyRewardId: reward._id,
            walletId: wallet._id,
            state: DailyRewardClaimState.Claimed,
        });
        claim = await DailyRewardClaimService.create({
            poolId: reward.poolId,
            walletId: wallet._id,
            dailyRewardId: String(reward._id),
            sub: wallet.sub,
            amount: reward.amounts[claims.length],
            state: DailyRewardClaimState.Pending,
        });
    }

    res.status(201).json(claim);
};

export default { validation, controller };
