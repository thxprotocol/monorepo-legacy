import { Request, Response } from 'express';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [];

const controller = async (req: Request, res: Response) => {
    const pools = await PoolService.getAllBySub(req.auth.sub);
    res.json(pools);
};

export { controller, validation };
