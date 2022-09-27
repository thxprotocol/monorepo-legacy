import { Response, NextFunction, Request } from 'express';
import AssetPoolService from '@thxnetwork/api/services/AssetPoolService';
import { SubjectUnauthorizedError } from '@thxnetwork/api/util/errors';

export async function assertPoolOwner(
    req: Request & { user: { sub: string; aud: string } },
    res: Response,
    next: NextFunction,
) {
    const pool = await AssetPoolService.getById(req.params.id);
    if (pool.sub !== req.auth.sub) throw new SubjectUnauthorizedError();
    req.assetPool = pool;
    next();
}
