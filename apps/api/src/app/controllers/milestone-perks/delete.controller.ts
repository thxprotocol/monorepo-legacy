import { NotFoundError } from '@thxnetwork/api/util/errors';
import MilestonePerkService from '@thxnetwork/api/services/MilestonePerkService';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('token').isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsToken']
    const { token } = req.params;
    await MilestonePerkService.delete(token);
    res.status(204).end();
};

export default { controller, validation };
