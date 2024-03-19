import { Request, Response } from 'express';
import { param, query } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';

export const validation = [
    param('id').isMongoId(),
    query('page').isInt(),
    query('limit').isInt(),
    query('page').optional().isString(),
    query('query').optional().isString(),
];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    const { page, limit } = req.query;
    const participants = await PoolService.findParticipants(pool, Number(page), Number(limit));

    res.json(participants);
};

export default { controller, validation };
