import RewardNftService from '@thxnetwork/api/services/RewardNftService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';

const validation = [
    param('id').exists(),
    body('isClaimOnce').optional().isBoolean(),
    body('state').optional().isNumeric(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsNft']
    let reward = await RewardNftService.get(req.params.id);
    console.log('SONO QUIIIIIII-------------------------------', reward);
    if (!reward) throw new NotFoundError('Could not find reward for this id');
    const result = await RewardNftService.update(reward, req.body);
    console.log('SONO QUIIIIIII-------------------------------', result);
    reward = await RewardNftService.get(req.params.id);
    console.log('SONO QUIIIIIII-------------------------------', reward);
    return res.json(reward);
};

export default { controller, validation };
