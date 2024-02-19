import { Request, Response } from 'express';
import { body } from 'express-validator';
import { InsufficientBalanceError, NotFoundError } from '@thxnetwork/api/util/errors';
import { BN } from 'bn.js';
import SafeService from '@thxnetwork/api/services/SafeService';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import ERC20 from '@thxnetwork/api/models/ERC20';

export const validation = [
    body('walletId').isMongoId(),
    body('erc20Id').exists().isMongoId(),
    body('to').exists().isString(),
    body('amount').exists().isString(),
    body('chainId').exists().isNumeric(),
];

export const controller = async (req: Request, res: Response) => {
    const erc20 = await ERC20.findById(req.body.erc20Id);
    if (!erc20) throw new NotFoundError('Could not find the ERC20');

    const wallet = await SafeService.findById(req.body.walletId);
    if (!wallet) throw new NotFoundError('Could not find wallet for account');

    const walletBalanceInWei = await erc20.contract.methods.balanceOf(wallet.address).call();
    const balanceInWei = new BN(walletBalanceInWei);
    const amountInWei = new BN(req.body.amount);
    if (amountInWei.gt(balanceInWei)) throw new InsufficientBalanceError();

    const tx = await ERC20Service.transferFrom(erc20, wallet, req.body.to, String(amountInWei));

    res.status(201).json(tx);
};
export default { controller, validation };
