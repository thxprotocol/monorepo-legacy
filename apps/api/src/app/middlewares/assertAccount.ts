import { Response, Request, NextFunction } from 'express';
import { NotFoundError } from '../util/errors';
import { Pool } from '@thxnetwork/api/models';
import AccountProxy from '../proxies/AccountProxy';

const assertAccount = async (req: Request, res: Response, next: NextFunction) => {
    const account = await AccountProxy.findById(req.auth.sub);
    if (!account) throw new Error('Account not found.');
    req.account = account;

    const poolId = req.header('X-PoolId');
    if (poolId) {
        const pool = await Pool.findById(poolId);
        if (!pool) throw new NotFoundError('Could not find campaign');
        req.campaign = pool;
    }

    next();
};

export { assertAccount };
