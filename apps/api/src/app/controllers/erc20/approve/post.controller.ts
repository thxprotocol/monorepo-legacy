import { Request, Response } from 'express';
import { body } from 'express-validator';
import { InsufficientBalanceError, NotFoundError } from '@thxnetwork/api/util/errors';
import { BN } from 'bn.js';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import ERC20 from '@thxnetwork/api/models/ERC20';
import WalletService from '@thxnetwork/api/services/WalletService';

export const validation = [
    body('erc20Id').exists().isMongoId(),
    body('amount').exists().isString(),
    body('chainId').exists().isNumeric(),
];

export const controller = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['ERC20Transaction']
    */
    const erc20 = await ERC20.findById(req.body.erc20Id);
    if (!erc20) throw new NotFoundError('Could not find the ERC20');

    const wallet = await WalletService.findPrimary(req.auth.sub, req.body.chainId);
    if (!wallet) throw new NotFoundError('Could not find wallet for account');
    ``;
    const amountInWei = new BN(req.body.amount);
    const balanceInWei = await erc20.contract.methods.balanceOf(wallet.address).call();
    const balance = new BN(balanceInWei);
    // Balance insufficient
    if (amountInWei.gt(balance)) throw new InsufficientBalanceError();

    const tx = await ERC20Service.approve(erc20, wallet, req.body.amount);

    // TX Hash should be confirmed by client and job will execute it
    res.json(tx);
};
export default { controller, validation };
