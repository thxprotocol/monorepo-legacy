import { Response, Request, NextFunction } from 'express';
import PoolService from '@thxnetwork/api/services/PoolService';
import { SubjectUnauthorizedError } from '@thxnetwork/api/util/errors';

export async function assertPoolAccess(
    req: Request & { user: { sub: string; aud: string } },
    res: Response,
    next: NextFunction,
) {
    const poolId = req.header('X-PoolId');
    if (req.auth.sub === req.auth.aud) return next();

    // If there is a sub check the account for pool ownership
    const hasAccess = await PoolService.hasAccess(req.auth.sub, poolId);
    if (!hasAccess) throw new SubjectUnauthorizedError();
    return next();
}
