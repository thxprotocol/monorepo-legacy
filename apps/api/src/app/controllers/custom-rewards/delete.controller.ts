import { Request, Response } from 'express';
import { CustomReward } from '@thxnetwork/api/models/CustomReward';
import { param } from 'express-validator';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    await CustomReward.findByIdAndDelete(req.params.id);
    res.status(204).end();
};

export default { controller, validation };
