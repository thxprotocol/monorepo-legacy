import BalancerService from '@thxnetwork/api/services/BalancerService';
import { Request, Response } from 'express';
import { query } from 'express-validator';

const validation = [query('page').isInt(), query('limit').isInt(), query('search').optional().isString()];

const controller = async (req: Request, res: Response) => {
    const apr = await BalancerService.getAPR();
    res.json(apr);
};

export default { validation, controller };
