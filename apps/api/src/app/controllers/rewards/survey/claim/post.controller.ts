import { Request, Response } from 'express';
import { SurveyReward } from '@thxnetwork/api/models/SurveyReward';
import PointBalanceService from '@thxnetwork/api/services/PointBalanceService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import PoolService from '@thxnetwork/api/services/PoolService';
import { SurveyRewardClaim } from '@thxnetwork/api/models/SurveyRewardClaim';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { SurveyRewardAttemp } from '@thxnetwork/api/models/SurveyRewardAttempt';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const reward = await SurveyReward.findOne({ uuid: req.params.uuid });
    if (!reward) {
        throw new NotFoundError('Could not find the reward');
    }
    const account = await AccountProxy.getById(req.auth.sub);
    const pool = await PoolService.getById(req.header('X-PoolId'));

    if (await SurveyRewardClaim.exists({ surveyRewardId: reward._id, sub: account.sub })) {
        return res.json({ error: 'You have claimed this reward already.' });
    }

    const attemp = await SurveyRewardAttemp.findOne({ surveyRewardId: reward._id, sub: account.sub });
    if (!attemp) {
        return res.json({ error: 'You have to complete the survey first' });
    }

    if (!attemp.result) {
        return res.json({ error: 'Your answers were not correct. Try again in 24 hours.' });
    }

    const claim = await SurveyRewardClaim.create({
        surveyRewardId: reward._id,
        poolId: pool._id,
        sub: req.auth.sub,
        amount: reward.amount,
    });

    await PointBalanceService.add(pool, req.auth.sub, reward.amount);

    res.status(201).json(claim);
};

export default { controller };
