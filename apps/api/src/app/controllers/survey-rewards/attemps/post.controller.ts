import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import SurveyRewardService from '@thxnetwork/api/services/SurveyRewardService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { SurveyReward } from '@thxnetwork/api/models/SurveyReward';
import { NotFoundError } from '@thxnetwork/api/util/errors';

const validation = [
    param('uuid').isString(),
    body('data').custom((value) => {
        console.log('data', value);
        if (!Array.isArray(value)) {
            throw new Error('data must be an array');
        }
        const isCorrectSchema = value.every(
            (item) =>
                item.surveyRewardQuestionId !== undefined && item.answers !== undefined && Array.isArray(item.answers),
        );

        if (!isCorrectSchema) {
            throw new Error('incorrect data schema');
        }
        return true;
    }),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Survey Rewards']
    const account = await AccountProxy.getById(req.auth.sub);

    const reward = await SurveyReward.findOne({ uuid: req.params.uuid });
    if (!reward) {
        throw new NotFoundError('Could not find the reward');
    }

    const attemp = await SurveyRewardService.submitAttemp(account, reward, req.body.data);
    res.status(201).json(attemp);
};

export default { validation, controller };
