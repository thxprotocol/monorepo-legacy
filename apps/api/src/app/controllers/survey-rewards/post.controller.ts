import { Request, Response } from 'express';
import { body } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import SurveyRewardService from '@thxnetwork/api/services/SurveyRewardService';
import { TSurveyRewardAnswer } from '@thxnetwork/types/interfaces';

const validation = [
    body('title').isString(),
    body('description').isString(),
    body('amount').isInt({ gt: 0 }),
    body('questions').custom((value) => {
        if (!Array.isArray(value)) {
            throw new Error('questions must be an array');
        }
        const isCorrectSchema = value.every(
            (item) =>
                item.question !== undefined &&
                Array.isArray(item.answers) &&
                item.answers.every(
                    (answer: TSurveyRewardAnswer) =>
                        answer.index !== undefined && answer.value !== undefined && answer.correct !== undefined,
                ),
        );
        if (!isCorrectSchema) {
            throw new Error('invalid questions schema');
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
    res.status(201).json({ ...reward.toJSON(), questions: await reward.questions });
};

export default { validation, controller };
