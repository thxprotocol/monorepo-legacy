import RewardTokenService from '@thxnetwork/api/services/RewardTokenService';
import { NotFoundError } from '@thxnetwork/api/util/errors';

import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { formatRewardToken } from '../rewards-utils';

const validation = [
    param('id').exists(),
    body('amount').optional().isInt({ gt: 0 }),
    body('isClaimOnce').optional().isBoolean(),
    body('state').optional().isNumeric(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsToken']
    let reward = await RewardTokenService.get(req.params.id);
    if (!reward) {
        throw new NotFoundError('Could not find the reward');
    }
    reward = await RewardTokenService.update(reward, req.body);
    const result = await formatRewardToken(reward);
    return res.json(result);
};

export default { controller, validation };
