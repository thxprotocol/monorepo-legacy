import { Request, Response } from 'express';
import { body } from 'express-validator';
import { InsufficientBalanceError, NotFoundError } from '@thxnetwork/api/util/errors';
import { Wallet } from '@thxnetwork/api/models/Wallet';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import ERC20 from '@thxnetwork/api/models/ERC20';
import { BN } from 'bn.js';

export const validation = [
    body('erc20Id').exists().isMongoId(),
    body('to').exists().isString(),
    body('amount').exists().isString(),
    body('chainId').exists().isNumeric(),
];

export const controller = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['ERC20Transaction']
    */
    const erc20 = await ERC20.findById(req.body.erc20Id);
    if (!erc20) throw new NotFoundError('Could not find the ERC20');

    const wallet = await Wallet.findOne({ chainId: req.body.chainId, sub: req.auth.sub });
    if (!wallet) throw new NotFoundError('Could not find wallet for account');

    const walletBalanceInWei = await erc20.contract.methods.balanceOf(wallet.address).call();
    const balanceInWei = new BN(walletBalanceInWei);
    const amountInWei = new BN(req.body.amount);
    if (amountInWei.gte(balanceInWei)) {
        throw new InsufficientBalanceError();
    }

    const erc20Transfer = await ERC20Service.transferFrom(erc20, wallet, req.body.to, String(amountInWei));

    res.status(201).json(erc20Transfer);
};
export default { controller, validation };
