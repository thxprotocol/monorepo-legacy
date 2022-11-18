import RewardTokenService from '@thxnetwork/api/services/RewardTokenService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';

const validation = [
    param('id').exists(),
    body('withdrawAmount').optional().isNumeric(),
    body('withdrawDuration').optional().isNumeric(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const reward = await RewardTokenService.get(req.params.id);
    if (!reward) throw new NotFoundError('Could not find reward for this id');
    const result = await RewardTokenService.update(reward, req.body);
    return res.json(result);
};

export default { controller, validation };
