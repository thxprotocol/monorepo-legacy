import { ERC20Perk } from '@thxnetwork/api/models/ERC20Perk';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import { toWei } from 'web3-utils';
import { BadRequestError, ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { getContractFromName } from '@thxnetwork/api/services/ContractService';
import { BigNumber } from 'ethers';
import { ERC20PerkPayment } from '@thxnetwork/api/models/ERC20PerkPayment';
import { ChainId, ERC20Type } from '@thxnetwork/types/enums';
import { Widget } from '@thxnetwork/api/models/Widget';
import PointBalanceService from '@thxnetwork/api/services/PointBalanceService';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import PoolService from '@thxnetwork/api/services/PoolService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import MailService from '@thxnetwork/api/services/MailService';
import SafeService from '@thxnetwork/api/services/SafeService';
import PerkService from '@thxnetwork/api/services/PerkService';
import { Participant } from '@thxnetwork/api/models/Participant';

const validation = [param('uuid').exists()];

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const safe = await SafeService.findOneByPool(pool, pool.chainId);
    if (!safe) throw new NotFoundError('Could not find campaign wallet');

    const erc20Perk = await ERC20Perk.findOne({ uuid: req.params.uuid });
    if (!erc20Perk) throw new NotFoundError('Could not find this perk');
    if (!erc20Perk.pointPrice) throw new NotFoundError('No point price for this perk has been set.');

    const erc20 = await ERC20Service.getById(erc20Perk.erc20Id);
    if (!erc20) throw new NotFoundError('Could not find the erc20 for this perk');

    const account = await AccountProxy.findById(req.auth.sub);
    const participant = await Participant.findOne({ sub: account.sub, poolId: pool._id });

    if (!participant || Number(participant.balance) < Number(erc20Perk.pointPrice)) {
        throw new BadRequestError('Not enough points on this account for this payment');
    }

    const redeemValidationResult = await PerkService.validate({ perk: erc20Perk, sub: req.auth.sub, pool });
    if (redeemValidationResult.isError) {
        throw new ForbiddenError(redeemValidationResult.errorMessage);
    }

    const wallet = await SafeService.findPrimary(account.sub, pool.chainId);
    const contract = getContractFromName(pool.chainId, 'LimitedSupplyToken', erc20.address);
    const amount = toWei(erc20Perk.amount).toString();
    const balanceOfPool = await contract.methods.balanceOf(safe.address).call();
    if (
        [ERC20Type.Unknown, ERC20Type.Limited].includes(erc20.type) &&
        BigNumber.from(balanceOfPool).lt(BigNumber.from(amount))
    ) {
        const owner = await AccountProxy.findById(pool.sub);
        await MailService.send(
            owner.email,
            `⚠️ Out of ${erc20.symbol}!"`,
            `Not enough ${erc20.symbol} available in campaign contract ${safe.address}. Please top up on ${
                ChainId[pool.chainId]
            }`,
        );
        throw new BadRequestError(
            `We have notified the campaign owner that there is insufficient ${erc20.symbol} in the campaign wallet. Please try again later!`,
        );
    }
    const tx = await ERC20Service.transferFrom(erc20, safe, wallet.address, amount);
    const erc20PerkPayment = await ERC20PerkPayment.create({
        perkId: erc20Perk.id,
        sub: req.auth.sub,
        walletId: wallet._id,
        poolId: erc20Perk.poolId,
        amount: erc20Perk.pointPrice,
    });

    await PointBalanceService.subtract(pool, account, erc20Perk.pointPrice);

    let html = `<p style="font-size: 18px">Congratulations!🚀</p>`;
    html += `<p>Your payment has been received and <strong>${erc20Perk.amount} ${erc20.symbol}</strong> dropped into your wallet!</p>`;
    html += `<p class="btn"><a href="${pool.campaignURL}}">View Wallet</a></p>`;

    await MailService.send(account.email, `🎁 Coin Drop! ${erc20Perk.amount} ${erc20.symbol}"`, html);

    res.status(201).json({ tx, erc20PerkPayment });
};

export default { controller, validation };
