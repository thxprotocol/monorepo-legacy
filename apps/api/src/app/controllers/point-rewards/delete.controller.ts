import { PointReward } from '@thxnetwork/api/services/PointRewardService';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    await PointReward.deleteOne(req.body);
    res.status(204).end();
};

export default { validation, controller };
