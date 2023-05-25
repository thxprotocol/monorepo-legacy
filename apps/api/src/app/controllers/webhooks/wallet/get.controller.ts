import { Request, Response } from 'express';
import { param } from 'express-validator';
import { Wallet } from '@thxnetwork/api/models/Wallet';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { MilestoneRewardClaim } from '@thxnetwork/api/models/MilestoneRewardClaims';

const validation = [param('code').exists().isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const wallet = await Wallet.findOne({ uuid: req.params.code });
    if (!wallet) throw new NotFoundError('Could not find the wallet.');

    const milestoneRewardClaims = await MilestoneRewardClaim.find({
        poolId: wallet.poolId,
        walletId: wallet._id,
        isClaimed: false,
    });
    const pointBalance = milestoneRewardClaims.reduce((acc, claim) => acc + claim.amount, 0);

    res.status(200).json({ wallet, pointBalance });
};

export default { controller, validation };
