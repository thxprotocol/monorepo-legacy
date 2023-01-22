import ClaimService from '@thxnetwork/api/services/ClaimService';
import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';
import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Milestone Rewards']
    const reward = await MilestoneReward.findById(req.params.id);
    MilestoneReward.findById(req.params.id);
    if (!reward) throw new NotFoundError();

    const claims = await ClaimService.findByReward(reward);

    res.json({ ...reward.toJSON(), claims });
};

export default { controller, validation };
