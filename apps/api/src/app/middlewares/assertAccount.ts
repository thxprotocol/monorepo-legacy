import { Response, Request, NextFunction } from 'express';
import { NotFoundError } from '../util/errors';
import { AssetPool } from '../models/AssetPool';
import AccountProxy from '../proxies/AccountProxy';
import SafeService from '../services/SafeService';

const assertAccount = async (req: Request, res: Response, next: NextFunction) => {
    const account = await AccountProxy.findById(req.auth.sub);
    if (!account) throw new Error('Account not found.');
    req.account = account;

    const wallet = await SafeService.findPrimary(req.auth.sub);
    if (!wallet) throw new Error('Safe not found.');
    req.wallet = wallet;

    const poolId = req.header('X-PoolId');
    if (poolId) {
        const pool = await AssetPool.findById(poolId);
        if (!pool) throw new NotFoundError('Could not find campaign');
        req.campaign = pool;
    }

    next();
};

export { assertAccount };
