import { Request, Response } from 'express';
import { body } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import SurveyRewardService from '@thxnetwork/api/services/SurveyRewardService';

const validation = [
    body('title').isString(),
    body('description').isString(),
    body('amount').isInt({ gt: 0 }),
    body('questions').custom((value) => {
        console.log('questions');
        if (!Array.isArray(value)) {
            throw new Error('questions must be an array');
        }
        if (
            !value.every((item) => item.index !== undefined && item.value !== undefined && item.correct !== undefined)
        ) {
            throw new Error('questions must contains answers');
        }
        return true;
    }),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Survey Rewards']
    const { title, description, amount, questions } = req.body;
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const reward = await SurveyRewardService.create(pool, {
        title,
        description,
        amount,
        questions,
    });
    res.status(201).json(reward);
};

export default { validation, controller };
