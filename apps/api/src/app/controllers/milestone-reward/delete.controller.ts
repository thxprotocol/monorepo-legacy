import { NotFoundError } from '@thxnetwork/api/util/errors';
import MilestoneRewardService from '@thxnetwork/api/services/MilestoneRewardService';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('id').isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsToken']
    const { id } = req.params;
    await MilestoneRewardService.delete(id);
    res.status(204).end();
};

export default { controller, validation };
