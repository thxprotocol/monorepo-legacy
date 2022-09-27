import { Response, Request, NextFunction } from 'express';
import AssetPoolService from '@thxnetwork/api/services/AssetPoolService';
import { SubjectUnauthorizedError, AudienceForbiddenError } from '@thxnetwork/api/util/errors';

export async function assertAssetPoolAccess(
    req: Request & { user: { sub: string; aud: string } },
    res: Response,
    next: NextFunction,
) {
    const poolId = req.header('X-PoolId');
    // If there is a sub check the account for user membership
    if (req.auth.sub) {
        const isOwner = await AssetPoolService.isPoolOwner(req.auth.sub, poolId);
        const hasMembership = await AssetPoolService.isPoolMember(req.auth.sub, poolId);
        if (!hasMembership && !isOwner) throw new SubjectUnauthorizedError();
        return next();
    }
    // If there is no sub check if client aud is equal to requested asset pool clientId
    // client_credentials grants make use of this flow since no subject is available.
    if (req.auth.aud) {
        const isPoolClient = await AssetPoolService.isPoolClient(req.auth.aud, poolId);
        if (!isPoolClient) throw new AudienceForbiddenError();
        return next();
    }
}
