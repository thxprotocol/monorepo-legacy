import { Request, Response } from 'express';
import { Claim } from '@thxnetwork/api/models/Claim';
import { SurveyReward } from '@thxnetwork/api/models/SurveyReward';

const validation = [];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Survey Rewards']
    const reward = await SurveyReward.findById(req.params.id);
    const isClaimed = !!(await Claim.exists({ sub: req.auth.sub, rewardUuid: reward.uuid }));

    res.json({ ...reward.toJSON(), isClaimed });
};

export default { controller, validation };
