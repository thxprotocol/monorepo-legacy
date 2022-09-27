import { NextFunction, Request, Response } from 'express';

import ClientProxy from '@thxnetwork/api/proxies/ClientProxy';
import { ForbiddenError } from '@thxnetwork/api/util/errors';

export async function validateClientAccess(req: Request, res: Response, next: NextFunction) {
    const client = await ClientProxy.get(req.params.clientId);
    if (client?.sub !== req.auth.sub) {
        return next(new ForbiddenError('Could not access this client for your user.'));
    }
    next();
}
