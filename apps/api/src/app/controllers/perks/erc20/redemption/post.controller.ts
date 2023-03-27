import { ERC20Perk } from '@thxnetwork/api/models/ERC20Perk';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import { toWei } from 'web3-utils';
import { BadRequestError, ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { getContractFromName } from '@thxnetwork/api/config/contracts';
import { BigNumber } from 'ethers';
import { ERC20PerkPayment } from '@thxnetwork/api/models/ERC20PerkPayment';
import { ERC20Type } from '@thxnetwork/types/enums';
import PointBalanceService, { PointBalance } from '@thxnetwork/api/services/PointBalanceService';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import WithdrawalService from '@thxnetwork/api/services/WithdrawalService';
import PoolService from '@thxnetwork/api/services/PoolService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { redeemValidation } from '@thxnetwork/api/util/perks';

const validation = [param('uuid').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Perks Payment']

    const pool = await PoolService.getById(req.header('X-PoolId'));
    const erc20Perk = await ERC20Perk.findOne({ uuid: req.params.uuid });
    if (!erc20Perk) throw new NotFoundError('Could not find this perk');

    const erc20 = await ERC20Service.getById(erc20Perk.erc20Id);
    if (!erc20) throw new NotFoundError('Could not find the erc20 for this perk');

    const pointBalance = await PointBalance.findOne({ sub: req.auth.sub, poolId: pool._id });
    if (!pointBalance || Number(pointBalance.balance) < Number(erc20Perk.pointPrice)) {
        throw new BadRequestError('Not enough points on this account for this payment');
    }

    const redeemValidationResult = await redeemValidation({ perk: erc20Perk, sub: req.auth.sub });
    if (redeemValidationResult.isError) {
        throw new ForbiddenError(redeemValidationResult.errorMessage);
    }

    const contract = getContractFromName(pool.chainId, 'LimitedSupplyToken', erc20.address);
    const amount = toWei(erc20Perk.amount).toString();
    const balanceOfPool = await contract.methods.balanceOf(pool.address).call();
    if (
        [ERC20Type.Unknown, ERC20Type.Limited].includes(erc20.type) &&
        BigNumber.from(balanceOfPool).lt(BigNumber.from(amount))
    ) {
        throw new BadRequestError('Not enough coins available in the pool for this transfer');
    }

    const account = await AccountProxy.getById(req.auth.sub);
    const address = await account.getAddress(pool.chainId);
    const withdrawal = await WithdrawalService.withdrawFor(pool, erc20, req.auth.sub, address, erc20Perk.amount, false);
    const erc20PerkPayment = await ERC20PerkPayment.create({
        perkId: erc20Perk.id,
        sub: req.auth.sub,
        poolId: erc20Perk.poolId,
    });

    await PointBalanceService.subtract(pool, req.auth.sub, erc20Perk.pointPrice);

    res.status(201).json({ withdrawal, erc20PerkPayment });
};

export default { controller, validation };
