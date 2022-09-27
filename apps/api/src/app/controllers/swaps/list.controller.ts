import { Request, Response } from 'express';
import ERC20SwapService from '@thxnetwork/api/services/ERC20SwapService';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC20Swaps']
    const swaps = await ERC20SwapService.getAll(req.assetPool);
    res.json(swaps);
};

export default { controller };
