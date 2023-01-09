import { Request, Response } from 'express';
import ERC20SwapService from '@thxnetwork/api/services/ERC20SwapService';
import PoolService from '@thxnetwork/api/services/PoolService';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC20Swaps']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const swaps = await ERC20SwapService.getAll(pool);
    res.json(swaps);
};

export default { controller };
