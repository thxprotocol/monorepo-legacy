import { Request, Response } from 'express';
import { body } from 'express-validator';
import SwapService from '@thxnetwork/api/services/ERC20SwapService';
import SwapRuleService from '@thxnetwork/api/services/ERC20SwapRuleService';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import { InsufficientBalanceError, NotFoundError } from '@thxnetwork/api/util/errors';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const validation = [body('amountIn').exists().isNumeric(), body('swapRuleId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC20Swaps']
    const swapRule = await SwapRuleService.get(req.body.swapRuleId);
    if (!swapRule) throw new NotFoundError('Could not find this Swap Rule');

    const erc20In = await ERC20Service.getById(swapRule.tokenInId);
    const erc20Out = await ERC20Service.getById(req.assetPool.erc20Id);
    const account = await AccountProxy.getById(req.auth.sub);
    const userBalance = await erc20In.contract.methods.balanceOf(account.address).call();
    if (Number(userBalance) < Number(req.body.amountIn)) throw new InsufficientBalanceError();

    const swap = await SwapService.create(req.assetPool, account, swapRule, erc20In, erc20Out, req.body.amountIn);

    res.json(swap);
};

export default {
    validation,
    controller,
};
