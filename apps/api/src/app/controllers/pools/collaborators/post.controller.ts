import { Request, Response } from 'express';
import { param, body } from 'express-validator';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import PoolService from '@thxnetwork/api/services/PoolService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

export const validation = [param('id').isMongoId(), body('email').isEmail()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    if (pool.sub !== req.auth.sub) throw new ForbiddenError('Only the pool owner can access this');
    const owner = await AccountProxy.getById(pool.sub);
    if (owner.email == req.body.email) throw new ForbiddenError('Can not invite the campaign owner');
    const account = await AccountProxy.getById(pool.sub);
    if (account.email == req.body.email) throw new ForbiddenError('Can not invite yourself');

    const collaborator = await PoolService.inviteCollaborator(pool, req.body.email);
    res.json(collaborator);
};

export default { controller, validation };
