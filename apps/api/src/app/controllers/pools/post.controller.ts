import { Request, Response } from 'express';
import { body } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [body('chainId').exists().isNumeric()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.deploy(req.auth.sub, req.body.chainId);

    res.status(201).json(pool);
};

export default { controller, validation };
