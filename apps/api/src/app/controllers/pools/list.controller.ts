import { Request, Response } from 'express';
import PoolService from '@thxnetwork/api/services/PoolService';
import { query } from 'express-validator';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

export const validation = [query('archived').optional().isBoolean(), query('chainId').optional().isInt()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const isArchived = req.query.archived ? JSON.parse(String(req.query.archived)) : false;
    const allPools = await PoolService.getAllBySub(req.auth.sub, isArchived);
    const pools = await Promise.all(
        allPools.map(async (p) => ({ ...p.toJSON(), owner: await AccountProxy.getById(p.sub) })),
    );

    res.json(pools);
};

export default { controller, validation };
