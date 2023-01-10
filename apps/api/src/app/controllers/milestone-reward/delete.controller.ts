import { NotFoundError } from '@thxnetwork/api/util/errors';
import MilestoneRewardService from '@thxnetwork/api/services/MilestoneRewardService';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('token').isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsToken']
    const { token } = req.params;
    await MilestoneRewardService.delete(token);
    res.status(204).end();
};

export default { controller, validation };
