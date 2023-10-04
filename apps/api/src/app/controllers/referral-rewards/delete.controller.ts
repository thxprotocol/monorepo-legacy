import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import ReferralRewardService from '@thxnetwork/api/services/ReferralRewardService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards Referral']
    const quest = await ReferralReward.findById(req.params.id);
    if (!quest) throw new NotFoundError('Could not find the reward');

    await ReferralRewardService.remove(quest);

    return res.status(204).end();
};

export default { controller, validation };
