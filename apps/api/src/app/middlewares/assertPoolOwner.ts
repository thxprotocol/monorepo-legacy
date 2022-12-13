import { Response, NextFunction, Request } from 'express';
import PoolService from '@thxnetwork/api/services/PoolService';
import { SubjectUnauthorizedError } from '@thxnetwork/api/util/errors';

export async function assertPoolOwner(
    req: Request & { user: { sub: string; aud: string } },
    res: Response,
    next: NextFunction,
) {
    const pool = await PoolService.getById(req.params.id);
    if (pool.sub !== req.auth.sub) throw new SubjectUnauthorizedError();
    req.assetPool = pool;
    next();
}
