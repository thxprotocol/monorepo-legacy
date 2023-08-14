import { Request, Response } from 'express';
import { param } from 'express-validator';
import { toWei } from 'web3-utils';
import { BadRequestError, ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { getContractFromName } from '@thxnetwork/api/config/contracts';
import { BigNumber } from 'ethers';
import { Event } from '@thxnetwork/types/enums';
import PointBalanceService, { PointBalance } from '@thxnetwork/api/services/PointBalanceService';
import PoolService from '@thxnetwork/api/services/PoolService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { Widget } from '@thxnetwork/api/models/Widget';
import MailService from '@thxnetwork/api/services/MailService';
import { Wallet } from '@thxnetwork/api/services/WalletService';
import PerkService from '@thxnetwork/api/services/PerkService';
import WebhookService from '@thxnetwork/api/services/WebhookService';
import { Webhook } from '@thxnetwork/api/models/Webhook';
import { CustomReward } from '@thxnetwork/api/models/CustomReward';
import { CustomRewardPayment } from '@thxnetwork/api/models/CustomRewardPayment';

const validation = [param('uuid').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Perks Payment']

    const pool = await PoolService.getById(req.header('X-PoolId'));
    const widget = await Widget.findOne({ poolId: pool._id });

    const customReward = await CustomReward.findOne({ uuid: req.params.uuid });
    if (!customReward) throw new NotFoundError('Could not find this reward');
    if (!customReward.pointPrice) throw new NotFoundError('No point price for this reward has been set.');

    const webhook = await Webhook.findById(customReward.webhookId);
    if (!webhook) throw new NotFoundError('Could not find the webhook for this reward');

    const account = await AccountProxy.getById(req.auth.sub);
    const wallet = await Wallet.findOne({ sub: account.sub, chainId: pool.chainId });
    const pointBalance = await PointBalance.findOne({ walletId: wallet._id, poolId: pool._id });

    if (!pointBalance || Number(pointBalance.balance) < Number(customReward.pointPrice)) {
        throw new BadRequestError('Not enough points on this account for this payment');
    }

    const redeemValidationResult = await PerkService.validate({ perk: customReward, sub: req.auth.sub, pool });
    if (redeemValidationResult.isError) {
        throw new ForbiddenError(redeemValidationResult.errorMessage);
    }

    await WebhookService.create(pool, {
        event: Event.RewardCustomPayment,
        data: { walletId: wallet._id, customRewardId: customReward._id },
    });

    const customRewardPayment = await CustomRewardPayment.create({
        perkId: customReward.id,
        sub: req.auth.sub,
        walletId: wallet._id,
        poolId: customReward.poolId,
        amount: customReward.pointPrice,
    });

    await PointBalanceService.subtract(pool, wallet._id, customReward.pointPrice);

    let html = `<p style="font-size: 18px">Congratulations!🚀</p>`;
    html += `<p>Your point redemption has been received and a custom reward has been created for you!</p>`;
    html += `<p class="btn"><a href="${widget.domain}">View Wallet</a></p>`;

    await MailService.send(account.email, `🎁 Custom Reward Received!"`, html);

    res.status(201).json({ customRewardPayment });
};

export default { controller, validation };
