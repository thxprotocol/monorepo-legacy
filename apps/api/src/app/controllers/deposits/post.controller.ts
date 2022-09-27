import { Request, Response } from 'express';
import { body } from 'express-validator';
import { AmountExceedsAllowanceError, BadRequestError, InsufficientBalanceError, NotFoundError } from '@thxnetwork/api/util/errors';
import { toWei } from 'web3-utils';
import DepositService from '@thxnetwork/api/services/DepositService';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import PromotionService from '@thxnetwork/api/services/PromotionService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const validation = [body('item').optional().isMongoId(), body('amount').optional().isNumeric()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Deposits']
    if (!req.body.amount && !req.body.item) {
        throw new BadRequestError('Could not find amount or item parameters in the body if this request.');
    }
    let value = req.body.amount;

    // If an item is referenced, replace the amount value with the price value
    if (req.body.item) {
        const promotion = await PromotionService.findById(req.body.item);
        if (!promotion) throw new NotFoundError('Could not find promotion');
        value = toWei(String(promotion.price));
    }

    const account = await AccountProxy.getById(req.auth.sub);
    const amount = value;
    const erc20 = await ERC20Service.findByPool(req.assetPool);

    // Check balance to ensure throughput
    const balance = await erc20.contract.methods.balanceOf(account.address).call();
    if (balance < Number(amount)) throw new InsufficientBalanceError();

    // Check allowance for admin to ensure throughput
    const allowance = Number(await erc20.contract.methods.allowance(account.address, req.assetPool.address).call());
    if (allowance < Number(amount)) throw new AmountExceedsAllowanceError();

    const deposit = await DepositService.deposit(req.assetPool, account, value, req.body.item);
    res.json(deposit);
};

export default {
    validation,
    controller,
};
