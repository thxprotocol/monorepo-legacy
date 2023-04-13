import { Request, Response } from 'express';
import { body } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import SurveyRewardService from '@thxnetwork/api/services/SurveyRewardService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { SurveyReward } from '@thxnetwork/api/models/SurveyReward';
import { NotFoundError } from '@thxnetwork/api/util/errors';

const validation = [
    body('uuid').isString(),
    body('data').custom((value) => {
        console.log('data');
        if (!Array.isArray(value)) {
            throw new Error('data must be an array');
        }
        if (
            !value.every(
                (item) =>
                    item.surveyRewardQuestionId !== undefined &&
                    item.answers !== undefined &&
                    !Array.isArray(item.answers),
            )
        ) {
            throw new Error('incorrect data');
        }
        return true;
    }),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Survey Rewards']
    const account = await AccountProxy.getById(req.auth.sub);
    const { uuid, data } = req.body;
    const reward = await SurveyReward.findOne({ uuid });
    if (!reward) {
        throw new NotFoundError('Could not find the reward');
    }
    const attemp = await SurveyRewardService.submitAttemp(account, reward, data);
    res.status(201).json(attemp);
};

export default { validation, controller };
