import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';
import RewardReferralService from '@thxnetwork/api/services/ReferralRewardService';

const validation = [param('id').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards Referral']
    const reward = await RewardReferralService.get(req.params.id);
    if (!reward) throw new NotFoundError();

    res.json({
        ...reward.toJSON(),
        poolAddress: req.assetPool.address,
    });
};

export default { controller, validation };
