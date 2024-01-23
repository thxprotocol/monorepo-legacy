import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Identity } from '@thxnetwork/api/models/Identity';
import { param } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.params.id);
    if (!pool) throw new NotFoundError('Could not find pool for client');

    await Identity.findByIdAndDelete(req.params.identityId);
    res.status(204).end();
};

export default { validation, controller };
