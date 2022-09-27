import { Request, Response } from 'express';
import { param } from 'express-validator';
import SwapRuleService from '@thxnetwork/api/services/ERC20SwapRuleService';
import { NotFoundError } from '@thxnetwork/api/util/errors';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC20SwapRules']
    const swapRule = await SwapRuleService.get(req.params.id);
    if (!swapRule) throw new NotFoundError();

    res.json(swapRule);
};

export default { controller, validation };
