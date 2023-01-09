import { Request, Response } from 'express';
import { query } from 'express-validator';
import ERC20SwapRuleService from '@thxnetwork/api/services/ERC20SwapRuleService';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [query('limit').optional().isInt({ gt: 0 }), query('page').optional().isInt({ gt: 0 })];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC20SwapRules']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const response = await ERC20SwapRuleService.findByQuery(
        pool.address,
        req.query.page ? Number(req.query.page) : null, // Will default to 1 if undefined
        req.query.limit ? Number(req.query.limit) : null, // Will default to 10 if undefined
    );

    res.send(response);
};

export default { controller, validation };
