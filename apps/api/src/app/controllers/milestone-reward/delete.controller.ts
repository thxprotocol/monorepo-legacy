import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    await MilestoneReward.findOneAndDelete({ _id: req.params.id });
    res.status(204).end();
};

export default { controller, validation };
