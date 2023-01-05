import { Request, Response } from 'express';
import { body } from 'express-validator';
import SwapRuleService from '@thxnetwork/api/services/ERC20SwapRuleService';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [body('tokenInAddress').exists(), body('tokenMultiplier').exists().isNumeric()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC20SwapRules']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const swapRule = await SwapRuleService.create(pool, req.body.tokenInAddress, req.body.tokenMultiplier);

    res.json(swapRule);
};

export default {
    validation,
    controller,
};
