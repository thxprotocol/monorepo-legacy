import BalancerService from '@thxnetwork/api/services/BalancerService';
import { Request, Response } from 'express';
import { query } from 'express-validator';

const validation = [query('page').isInt(), query('limit').isInt(), query('search').optional().isString()];

const controller = async (req: Request, res: Response) => {
    const result = BalancerService.getAPR();
    res.json(result);
};

export default { validation, controller };
