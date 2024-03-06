import { Request, Response } from 'express';
import { Pool, Identity } from '@thxnetwork/api/models';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';

const validation = [param('uuid').isUUID()];

const controller = async (req: Request, res: Response) => {
    const pool = await Pool.findById(req.header('X-PoolId'));
    if (!pool) throw new NotFoundError('Pool not found.');

    const { uuid } = req.params;
    const { sub } = req.auth;

    // Throw if Identity is connected already
    const isConnected = await Identity.exists({ uuid, sub: { $exists: true } });
    if (isConnected) throw new ForbiddenError('Identity already connected.');

    const identity = await Identity.findOneAndUpdate({ uuid }, { sub }, { new: true });

    res.json(identity);
};

export default { validation, controller };
