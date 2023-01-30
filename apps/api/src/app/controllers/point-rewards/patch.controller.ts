import { PointReward } from '@thxnetwork/api/services/PointRewardService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';

const validation = [
    param('id').exists(),
    body('title').isString(),
    body('description').isString(),
    body('amount').isInt({ gt: 0 }),
    body('expiryDate').optional().isString(),
    body('platform').isNumeric(),
    body('interaction').optional().isNumeric(),
    body('content').optional().isString(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsNft']
    let reward = await PointReward.findById(req.params.id);
    if (!reward) throw new NotFoundError('Could not find the reward');
    reward = await PointReward.findByIdAndUpdate(reward._id, {
        title: req.body.title,
        description: req.body.description,
        amount: req.body.amount,
        expiryDate: req.body.expiryDate,
        platform: req.body.platform,
        interaction: req.body.interaction,
        content: req.body.content,
    });

    return res.json(reward);
};

export default { controller, validation };
