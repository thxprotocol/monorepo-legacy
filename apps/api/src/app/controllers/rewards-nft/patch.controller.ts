import RewardNftService from '@thxnetwork/api/services/RewardNftService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';

const validation = [
    param('id').exists(),
    body('withdrawAmount').optional().isNumeric(),
    body('withdrawDuration').optional().isNumeric(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsNft']
    const reward = await RewardNftService.get(req.params.id);
    if (!reward) throw new NotFoundError('Could not find reward for this id');
    const result = await RewardNftService.update(reward, req.body);
    return res.json(result);
};

export default { controller, validation };
