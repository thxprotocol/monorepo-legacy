import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import ReferralRewardService from '@thxnetwork/api/services/ReferralRewardService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsReferral']
    const reward = await ReferralRewardService.get(req.params.id);
    if (!reward) throw new NotFoundError('Could not find the reward');
    await ReferralRewardService.remove(reward);
    return res.status(204).end();
};

export default { controller, validation };
