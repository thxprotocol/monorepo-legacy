import { ERC20Perk } from '@thxnetwork/api/models/ERC20Perk';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import { toWei } from 'web3-utils';
import { InsufficientBalanceError, NotFoundError } from '@thxnetwork/api/util/errors';
import { getContractFromName } from '@thxnetwork/api/config/contracts';
import { BigNumber } from 'ethers';
import { ERC20PerkPayment } from '@thxnetwork/api/models/ERC20PerkPayment';
import PointBalanceService, { PointBalance } from '@thxnetwork/api/services/PointBalanceService';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import WalletService from '@thxnetwork/api/services/WalletService';

const validation = [param('uuid').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Perks Payment']

    const erc20Perk = await ERC20Perk.findOne({ uuid: req.params.uuid });
    if (!erc20Perk) throw new NotFoundError('Could not find this perk');

    const erc20 = await ERC20Service.findByPool(req.assetPool);
    if (!erc20Perk) throw new NotFoundError('Could not find the erc20 for this perk');

    const contract = getContractFromName(req.body.chainId, 'LimitedSupplyToken', erc20.address);
    const amount = toWei(erc20Perk.amount).toString();

    const balanceOfPool = await contract.methods.balanceOf(req.assetPool.address).call();
    if (BigNumber.from(balanceOfPool).lt(BigNumber.from(amount))) throw new InsufficientBalanceError();

    const { balance } = await PointBalance.findOne({ sub: req.auth.sub, poolId: req.assetPool._id });
    if (Number(balance) < Number(erc20Perk.pointPrice))
        throw new InsufficientBalanceError('Not enough points on this account for this pool.');

    const wallet = await WalletService.findOneByQuery({ sub: req.auth.sub, chainId: req.assetPool.chainId });
    const erc20Transfer = await ERC20Service.transferFrom(
        erc20,
        req.assetPool.address,
        wallet.address,
        amount,
        req.assetPool.chainId,
        req.auth.sub,
    );

    const erc20PerkPayment = await ERC20PerkPayment.create({ perkId: erc20Perk.id, sub: req.auth.sub });

    await PointBalanceService.subtract(req.assetPool, req.auth.sub, erc20Perk.pointPrice);

    res.status(201).json({ erc20Transfer, erc20PerkPayment });
};

export default { controller, validation };
