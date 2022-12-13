import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { BadRequestError, InsufficientBalanceError } from '@thxnetwork/api/util/errors';
import { toWei } from 'web3-utils';
import { getProvider } from '@thxnetwork/api/util/network';
import { ethers } from 'ethers';
import { ERC20Type } from '@thxnetwork/api/types/enums';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import TransactionService from '@thxnetwork/api/services/TransactionService';
import PoolService from '@thxnetwork/api/services/PoolService';

export const validation = [param('id').isMongoId(), body('amount').isInt({ gt: 0 })];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const { defaultAccount } = getProvider(req.assetPool.chainId);
    const amount = toWei(String(req.body.amount));
    const erc20 = await ERC20Service.findByPool(req.assetPool);

    if (erc20.type !== ERC20Type.Limited) throw new BadRequestError('Token type is not Limited type');

    // Check balance to ensure throughput
    const balance = await erc20.contract.methods.balanceOf(defaultAccount).call();
    if (Number(balance) < Number(amount)) throw new InsufficientBalanceError();

    // Check allowance for admin to ensure throughput
    const allowance = await erc20.contract.methods.allowance(defaultAccount, req.assetPool.address).call();
    if (Number(allowance) < Number(amount)) {
        await TransactionService.send(
            erc20.contract.options.address,
            erc20.contract.methods.approve(req.assetPool.address, ethers.constants.MaxUint256),
            req.assetPool.chainId,
        );
    }

    const topup = await PoolService.topup(req.assetPool, amount);

    res.json(topup);
};

export default { validation, controller };
