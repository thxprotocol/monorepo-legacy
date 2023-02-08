import { Request, Response } from 'express';
import PoolService from '@thxnetwork/api/services/PoolService';
import { query } from 'express-validator';

export const validation = [query('archived').optional().isBoolean(), query('chainId').optional().isInt()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const archived = req.query.archived ? JSON.parse(String(req.query.archived)) : false;
    const chainId = req.query.chainId ? Number(req.query.chainId) : undefined;
    const pools = await PoolService.getAllBySub(req.auth.sub, archived, chainId);
    res.json(pools);
};

export default { controller, validation };
