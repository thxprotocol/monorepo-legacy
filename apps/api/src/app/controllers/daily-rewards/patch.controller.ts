import { DailyReward } from '@thxnetwork/api/services/DailyRewardService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';

const validation = [
    param('id').exists(),
    body('title').optional().isString(),
    body('description').optional().isString(),
    body('amount').optional().isInt({ gt: 0 }),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Daily Rewards']
    let dailyReward = await DailyReward.findById(req.params.id);
    if (!dailyReward) throw new NotFoundError('Could not find the dailyReward');
    await dailyReward.updateOne({
        title: req.body.title,
        description: req.body.description,
        amount: req.body.amount,
    });
    dailyReward = await DailyReward.findById(req.params.id);
    return res.json(dailyReward);
};

export default { controller, validation };
