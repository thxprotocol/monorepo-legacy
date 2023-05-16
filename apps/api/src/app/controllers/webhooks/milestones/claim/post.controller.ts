import MilestoneRewardClaimService from '@thxnetwork/api/services/MilestoneRewardClaimService';
import WalletService, { Wallet } from '@thxnetwork/api/services/WalletService';
import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import { MilestoneRewardClaim } from '@thxnetwork/api/models/MilestoneRewardClaims';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';
import { v4 } from 'uuid';

const validation = [body('address').exists(), param('token').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const reward = await MilestoneReward.findOne({ uuid: req.params.token });
    if (!reward) throw new NotFoundError('Could not find a milestone reward for this token');

    let wallet = await WalletService.findOneByAddress(req.body.address);
    if (!wallet) {
        // Prepare a wallet for this address
        const pool = await AssetPool.findById(reward.poolId);
        wallet = await Wallet.create({ chainId: pool.chainId, address: req.body.address, token: v4() });
    }

    if (reward.limit) {
        const claimsForAccount = await MilestoneRewardClaim.count({ milestoneRewardId: reward.id, sub: wallet.sub });
        if (claimsForAccount >= reward.limit)
            throw new ForbiddenError('This reward has reached its limit for this account.');
    }

    const claim = await MilestoneRewardClaimService.create({
        milestoneRewardId: String(reward._id),
        walletId: String(wallet._id),
        amount: String(reward.amount),
        poolId: reward.poolId,
    });

    res.status(201).json(claim);
};

export default { validation, controller };
