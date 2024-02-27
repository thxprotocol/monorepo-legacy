import { Request, Response } from 'express';
import { RewardCustom } from '@thxnetwork/api/models';
import { param } from 'express-validator';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    await RewardCustom.findByIdAndDelete(req.params.id);
    res.status(204).end();
};

export default { controller, validation };
