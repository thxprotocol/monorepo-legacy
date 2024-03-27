import { Response, Request, NextFunction } from 'express';
import PoolService from '@thxnetwork/api/services/PoolService';
import { AudienceUnauthorizedError, ForbiddenError, SubjectUnauthorizedError } from '@thxnetwork/api/util/errors';
import { ALLOWED_API_CLIENT_ID } from '../config/secrets';

export async function assertPoolAccess(
    req: Request & { user: { sub: string; aud: string } },
    res: Response,
    next: NextFunction,
) {
    if (req.auth.aud === ALLOWED_API_CLIENT_ID && ALLOWED_API_CLIENT_ID) return next();

    const poolId = req.header('X-PoolId') || req.params.id; // Deprecate the header non pool child resources are tested
    if (!poolId) throw new ForbiddenError('Missing id param or X-PoolId header');

    // If there is a sub check if the user is an owner or collaborator
    const isSubjectAllowed = await PoolService.isSubjectAllowed(req.auth.sub, poolId);
    if (req.auth.sub !== req.auth.aud && !isSubjectAllowed) throw new SubjectUnauthorizedError();

    const isAudienceAllowed = await PoolService.isAudienceAllowed(req.auth.aud, poolId);
    // Equal sub and aud are client_credentials grants
    if (req.auth.sub === req.auth.aud && !isAudienceAllowed) throw new AudienceUnauthorizedError();

    next();
}
