import { Request, Response } from 'express';
import { DailyReward } from '@thxnetwork/api/services/DailyRewardService';
import { param } from 'express-validator';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Daily Rewards']
    const dailyReward = await DailyReward.findById(req.params.id);

    res.json({ ...dailyReward.toJSON() });
};

export default { controller, validation };
