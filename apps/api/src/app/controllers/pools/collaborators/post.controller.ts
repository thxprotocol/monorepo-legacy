import { Request, Response } from 'express';
import { param, body } from 'express-validator';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import PoolService from '@thxnetwork/api/services/PoolService';

export const validation = [param('id').isMongoId(), body('email').isEmail()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    if (pool.sub !== req.auth.sub) throw new ForbiddenError('Only the pool owner can access this');

    const collaborator = await PoolService.inviteCollaborator(pool, req.body.email);
    res.json(collaborator);
};

export default { controller, validation };
