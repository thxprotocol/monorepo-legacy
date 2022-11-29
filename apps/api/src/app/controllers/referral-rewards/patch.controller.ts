import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import RewardReferralService from '@thxnetwork/api/services/ReferralRewardService';

const validation = [
    param('id').exists(),
    body('withdrawAmount').optional().isNumeric(),
    body('withdrawDuration').optional().isNumeric(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsReferral']
    const reward = await RewardReferralService.get(req.params.id);
    if (!reward) throw new NotFoundError('Could not find the reward for this id');
    const result = await RewardReferralService.update(reward, req.body);
    return res.json(result);
};

export default { controller, validation };
