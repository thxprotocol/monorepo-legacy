import RewardNftService from '@thxnetwork/api/services/RewardNftService';
import { NotFoundError } from '@thxnetwork/api/util/errors';

import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { formatRewardNft } from '../rewards-utils';

const validation = [
    param('id').exists(),
    body('isClaimOnce').optional().isBoolean(),
    body('state').optional().isNumeric(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsNft']
    let reward = await RewardNftService.get(req.params.id);
    if (!reward) {
        throw new NotFoundError('Could not find the reward');
    }
    reward = await RewardNftService.update(reward, req.body);
    const result = await formatRewardNft(reward);
    return res.json(result);
};

export default { controller, validation };
