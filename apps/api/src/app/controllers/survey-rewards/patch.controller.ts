import { SurveyReward } from '@thxnetwork/api/models/SurveyReward';
import SurveyRewardService from '@thxnetwork/api/services/SurveyRewardService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { TSurveyRewardAnswer } from '@thxnetwork/types/interfaces';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';

const validation = [
    param('id').exists(),
    body('title').optional().isString(),
    body('description').optional().isString(),
    body('amount').optional().isInt({ gt: 0 }),
    body('questions')
        .optional()
        .custom((value) => {
            if (!Array.isArray(value)) {
                throw new Error('questions must be an array');
            }
            const isCorrectSchema = value.every(
                (item) =>
                    item.question !== undefined &&
                    Array.isArray(item.answers) &&
                    item.answers.every(
                        (answer: TSurveyRewardAnswer) => answer.value !== undefined && answer.correct !== undefined,
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
    let reward = await SurveyReward.findById(req.params.id);
    if (!reward) throw new NotFoundError('Could not find the reward');
    const { title, description, amount, questions } = req.body;
    reward = await SurveyRewardService.update(reward, {
        title,
        description,
        amount,
        questions,
    });

    return res.json({ ...reward.toJSON(), questions: await reward.questions });
};

export default { controller, validation };
