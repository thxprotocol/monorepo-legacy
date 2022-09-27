import { Request, Response } from 'express';
import { body } from 'express-validator';
import SwapRuleService from '@thxnetwork/api/services/ERC20SwapRuleService';

const validation = [body('tokenInAddress').exists(), body('tokenMultiplier').exists().isNumeric()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC20SwapRules']
    const swapRule = await SwapRuleService.create(req.assetPool, req.body.tokenInAddress, req.body.tokenMultiplier);

    res.json(swapRule);
};

export default {
    validation,
    controller,
};
