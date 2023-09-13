import { Request, Response } from 'express';
import { param } from 'express-validator';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import PoolService from '@thxnetwork/api/services/PoolService';
import { Collaborator } from '@thxnetwork/api/models/Collaborator';

export const validation = [param('id').isMongoId(), param('uuid').isUUID(4)];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    const collaborator = await Collaborator.findOne({ poolId: pool._id, uuid: req.params.uuid });
    if (!collaborator) throw new NotFoundError('Could not find collaborator');
    if (collaborator.sub === pool.sub) throw new ForbiddenError('Can not remove campaign owner');

    await collaborator.deleteOne();

    res.status(204).end();
};

export default { controller, validation };
