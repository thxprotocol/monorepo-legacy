import { IAccount } from '@thxnetwork/api/models/Account';
import { ERC20Perk } from '@thxnetwork/api/models/ERC20Perk';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import { getProvider } from '@thxnetwork/api/util/network';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { AmountExceedsAllowanceError, InsufficientBalanceError, NotFoundError } from '@thxnetwork/api/util/errors';
import { toWei } from 'web3-utils';
import { getContractFromName } from '@thxnetwork/api/config/contracts';
import { BigNumber } from 'ethers';
import { ERC20PerkPurchase } from '@thxnetwork/api/models/ERC20PerkPurchase';
import PointBalanceService from '@thxnetwork/api/services/PointBalanceService';

const validation = [param('id').exists().isMongoId(), body('chainId').exists().isNumeric()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC20Perks Purchase']

    const erc20Perk = await ERC20Perk.findById(req.params.id);
    if (!erc20Perk) {
        throw new NotFoundError('Could not find this perk');
    }

    const pool = req.assetPool;
    const erc20 = await ERC20Service.findByPool(pool);
    const account: IAccount = await AccountProxy.getById(req.auth.sub);
    // transfer erc20 tokens fro the pool to the user wallet contract address
    const contractName = 'LimitedSupplyToken';
    const contract = getContractFromName(req.body.chainId, contractName, erc20.address);
    const from = pool.address;
    const to = account.walletAddress;
    const amount = toWei(erc20Perk.amount).toString();

    // check the balance
    const balance = await contract.methods.balanceOf(from).call();
    if (BigNumber.from(balance).lt(BigNumber.from(amount))) {
        console.log('InsufficientBalanceError', balance.toString());
        throw new InsufficientBalanceError();
    }

    // Check allowance
    const { defaultAccount } = getProvider(req.body.chainId);
    const allowance = await contract.methods.allowance(from, defaultAccount).call();

    if (BigNumber.from(allowance).lt(BigNumber.from(amount))) {
        console.log('AmountExceedsAllowanceError', allowance.toString());
        throw new AmountExceedsAllowanceError();
    }
    //transfer erc20 tokens fro the pool to the user wallet contract address
    const erc20Transfer = await ERC20Service.transferFrom(erc20, from, to, amount, req.body.chainId, req.auth.sub);

    // create an ERC20PerkPurchase object
    const erc20PerkPurchase = await ERC20PerkPurchase.create({ perkId: erc20Perk.id, sub: req.auth.sub });

    // subtract the pool points (points-balance) from the balance of the authenticated user
    if (erc20Perk.pointPrice) {
        await PointBalanceService.subtract(pool, req.auth.sub, erc20Perk.amount);
    }
    res.status(201).json({ erc20Transfer, erc20PerkPurchase });
};

export default { controller, validation };
