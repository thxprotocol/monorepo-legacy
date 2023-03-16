import { Response, Request, NextFunction } from 'express';
import { AudienceForbiddenError } from '@thxnetwork/api/util/errors';
import { Client } from '../models/Client';

export async function assertAssetPoolOwnership(
    req: Request & { user: { sub: string; aud: string } },
    res: Response,
    next: NextFunction,
) {
    const poolId = req.header('X-PoolId');
    // If there is no sub check if client aud is equal to requested asset pool clientId
    // client_credentials grants make use of this flow since no subject is available.
    if (req.auth.aud) {
        const isPoolClient = await Client.exists({ poolId, clientId: req.auth.aud });
        if (!isPoolClient) throw new AudienceForbiddenError();
        return next();
    }
}
