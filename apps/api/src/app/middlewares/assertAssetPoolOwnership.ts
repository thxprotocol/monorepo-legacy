import { Response, Request, NextFunction } from 'express';
import PoolService from '@thxnetwork/api/services/PoolService';
import { SubjectUnauthorizedError, AudienceForbiddenError } from '@thxnetwork/api/util/errors';

export async function assertAssetPoolOwnership(
    req: Request & { user: { sub: string; aud: string } },
    res: Response,
    next: NextFunction,
) {
    const poolId = req.header('X-PoolId');
    // If there is a sub check the account for pool ownership
    if (req.auth.sub) {
        const isOwner = await PoolService.isPoolOwner(req.auth.sub, poolId);
        if (!isOwner) throw new SubjectUnauthorizedError();
        return next();
    }
    // If there is no sub check if client aud is equal to requested asset pool clientId
    // client_credentials grants make use of this flow since no subject is available.
    if (req.auth.aud) {
        const isPoolClient = await PoolService.isPoolClient(req.auth.aud, poolId);
        if (!isPoolClient) throw new AudienceForbiddenError();
        return next();
    }
}
