import { Request, Response } from 'express';
import { body } from 'express-validator';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import { AmountExceedsAllowanceError, InsufficientBalanceError, NotFoundError } from '@thxnetwork/api/util/errors';
import { toWei } from 'web3-utils';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { getProvider } from '@thxnetwork/api/util/network';
import { getContractFromName } from '@thxnetwork/api/config/contracts';
import { BigNumber } from 'ethers';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';

export const validation = [
    body('poolId').exists().isMongoId(),
    body('erc20').exists().isString(),
    body('receiver').exists().isString(),
    body('amount').exists().isString(),
];

export const controller = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['ERC20Transaction']
    */
    const account = await AccountProxy.getById(req.auth.sub);

    const assetpool = await AssetPool.findById(req.body.poolId);

    if (!assetpool) {
        throw new NotFoundError('Could not find the Asset Pool');
    }

    const erc20 = await ERC20Service.findOrImport(assetpool, req.body.erc20);

    const contractName = 'LimitedSupplyToken';
    const contract = getContractFromName(assetpool.chainId, contractName, erc20.address);
    const sender = account.address;
    const amount = toWei(req.body.amount).toString();

    // Check balance to ensure throughput
    const balance = await contract.methods.balanceOf(sender).call();
    if (Number(balance) < Number(amount)) throw new InsufficientBalanceError();

    // Check allowance to ensure throughput
    const { defaultAccount } = getProvider(assetpool.chainId);
    const allowance = await contract.methods.allowance(sender, defaultAccount).call();

    if (BigNumber.from(allowance).lt(BigNumber.from(amount))) throw new AmountExceedsAllowanceError();

    const erc20Transfer = await ERC20Service.transferFrom(erc20, sender, req.body.receiver, amount, assetpool);

    res.status(201).json(erc20Transfer);
};
export default { controller, validation };
