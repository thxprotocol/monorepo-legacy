import { Response, Request, NextFunction } from 'express';
import PoolService from '@thxnetwork/api/services/PoolService';
import { ForbiddenError, SubjectUnauthorizedError } from '@thxnetwork/api/util/errors';

export async function assertPoolAccess(
    req: Request & { user: { sub: string; aud: string } },
    res: Response,
    next: NextFunction,
) {
    if (req.auth.sub === req.auth.aud) return next();

    const poolId = req.header('X-PoolId');
    if (!poolId) throw new ForbiddenError('Missing X-PoolId header');

    // If there is a sub check if the user is an owner or collaborator
    const hasAccess = await PoolService.hasAccess(req.auth.sub, poolId);
    if (!hasAccess) throw new SubjectUnauthorizedError();

    next();
}
