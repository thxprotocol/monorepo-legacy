import { Request, Response } from 'express';
import { param, query } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';

export const validation = [
    param('id').isMongoId(),
    query('page').isInt(),
    query('limit').isInt(),
    query('page').optional().isString(),
];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    const { page, limit } = req.query;
    const gates = await PoolService.findGates(pool, Number(page), Number(limit));
    res.json(gates);
};

export default { controller, validation };
