import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import ERC20RewardService from '@thxnetwork/api/services/ERC20RewardService';

const validation = [
    param('id').exists(),
    body('amount').optional().isInt({ gt: 0 }),
    body('isClaimOnce').optional().isBoolean(),
    body('state').optional().isNumeric(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsToken']
    let reward = await ERC20RewardService.get(req.params.id);
    if (!reward) {
        throw new NotFoundError('Could not find the reward');
    }
    reward = await ERC20RewardService.update(reward, req.body);
    return res.json(reward.toJSON());
};

export default { controller, validation };
