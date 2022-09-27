import { Request, Response } from 'express';
import ERC20SwapService from '@thxnetwork/api/services/ERC20SwapService';
import { param } from 'express-validator';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC20Swaps']
    const members = await ERC20SwapService.get(req.params.id);

    res.json(members);
};

export default { controller, validation };
