import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';
import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import { MilestoneRewardClaim } from '@thxnetwork/api/models/MilestoneRewardClaims';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Milestone Rewards']
    const reward = await MilestoneReward.findById(req.params.id);
    if (!reward) throw new NotFoundError();

    const claims = await MilestoneRewardClaim.find({ questId: String(reward._id) });

    res.json({ ...reward.toJSON(), claims });
};

export default { controller, validation };
