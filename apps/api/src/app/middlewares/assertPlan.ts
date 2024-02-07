import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { AccountPlanType } from '@thxnetwork/types/enums';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import { Response, Request, NextFunction } from 'express';
import PoolService from '../services/PoolService';

export function assertPlan(plans: AccountPlanType[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const pool = await PoolService.getById(req.header('X-PoolId'));
        const account = await AccountProxy.findById(pool.sub);
        if (!plans.includes(account.plan)) {
            throw new ForbiddenError('Active plan of this pool owner is not sufficient.');
        }
        next();
    };
}
