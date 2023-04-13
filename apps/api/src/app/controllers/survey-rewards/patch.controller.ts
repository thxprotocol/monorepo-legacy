import { SurveyReward } from '@thxnetwork/api/models/SurveyReward';
import PoolService from '@thxnetwork/api/services/PoolService';
import SurveyRewardService from '@thxnetwork/api/services/SurveyRewardService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';

const validation = [
    param('id').exists(),
    body('title').isString(),
    body('description').isString(),
    body('amount').isInt({ gt: 0 }),
    body('questions')
        .optional()
        .custom((value) => {
            console.log('questions');
            if (!Array.isArray(value)) {
                throw new Error('questions must be an array');
            }
            if (
                !value.every(
                    (item) => item.index !== undefined && item.value !== undefined && item.correct !== undefined,
                )
            ) {
                throw new Error('questions must contains answers');
            }
            return true;
        }),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Survey Rewards']
    let reward = await SurveyReward.findById(req.params.id);
    if (!reward) throw new NotFoundError('Could not find the reward');
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const { title, description, amount, questions } = req.body;
    reward = await SurveyRewardService.update(pool, {
        title,
        description,
        amount,
        questions,
    });

    return res.json(reward);
};

export default { controller, validation };
