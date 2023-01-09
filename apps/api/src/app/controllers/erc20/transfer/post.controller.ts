import { Request, Response } from 'express';
import { body } from 'express-validator';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import { AmountExceedsAllowanceError, InsufficientBalanceError, NotFoundError } from '@thxnetwork/api/util/errors';
import { toWei } from 'web3-utils';
import { getProvider } from '@thxnetwork/api/util/network';
import { getContractFromName } from '@thxnetwork/api/config/contracts';
import { BigNumber } from 'ethers';
import ERC20 from '@thxnetwork/api/models/ERC20';

export const validation = [
    body('erc20').exists().isString(),
    body('from').exists().isString(),
    body('to').exists().isString(),
    body('amount').exists().isString(),
    body('chainId').exists().isNumeric(),
];

export const controller = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['ERC20Transaction']
    */
    const erc20 = await ERC20.findOne({ address: req.body.erc20 });
    if (!erc20) throw new NotFoundError('Could not find the ERC20');

    const contract = getContractFromName(req.body.chainId, 'LimitedSupplyToken', erc20.address);
    const amount = toWei(req.body.amount).toString();

    // Check balance to ensure throughput
    const balance = await contract.methods.balanceOf(req.body.from).call();
    if (Number(balance) < Number(amount)) throw new InsufficientBalanceError();

    // Check allowance to ensure throughput
    const { defaultAccount } = getProvider(req.body.chainId);
    const allowance = await contract.methods.allowance(req.body.from, defaultAccount).call();

    if (BigNumber.from(allowance).lt(BigNumber.from(amount))) throw new AmountExceedsAllowanceError();

    const erc20Transfer = await ERC20Service.transferFrom(
        erc20,
        req.body.from,
        req.body.to,
        amount,
        req.body.chainId,
        req.auth.sub,
    );

    res.status(201).json(erc20Transfer);
};
export default { controller, validation };
