import { Request, Response } from 'express';
import { param, query } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';

export const validation = [
    param('id').isMongoId(),
    query('page').isInt(),
    query('limit').isInt(),
    query('page').optional().isString(),
    query('query').optional().isString().isLength({ min: 3 }),
];

export const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.params.id);
    const { page, limit, query } = req.query;
    const participants = await PoolService.findParticipants(pool, Number(page), Number(limit), query as string);

    res.json(participants);
};

export default { controller, validation };
