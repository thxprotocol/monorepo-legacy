import { Response, Request, NextFunction } from 'express';
import PoolService from '@thxnetwork/api/services/PoolService';
import { SubjectUnauthorizedError } from '@thxnetwork/api/util/errors';

export async function assertAssetPoolOwnership(
    req: Request & { user: { sub: string; aud: string } },
    res: Response,
    next: NextFunction,
) {
    const poolId = req.header('X-PoolId');
    if (req.auth.sub === req.auth.aud) return next();

    // If there is a sub check the account for pool ownership
    const isOwner = await PoolService.isPoolOwner(req.auth.sub, poolId);
    if (!isOwner) throw new SubjectUnauthorizedError();
    return next();
}
