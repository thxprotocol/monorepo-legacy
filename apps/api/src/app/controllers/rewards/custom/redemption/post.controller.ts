import { Request, Response } from 'express';
import { param } from 'express-validator';
import { BadRequestError, ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { Event } from '@thxnetwork/types/enums';
import { Webhook } from '@thxnetwork/api/models/Webhook';
import { CustomReward } from '@thxnetwork/api/models/CustomReward';
import { CustomRewardPayment } from '@thxnetwork/api/models/CustomRewardPayment';
import { Participant } from '@thxnetwork/api/models/Participant';
import PointBalanceService from '@thxnetwork/api/services/PointBalanceService';
import PoolService from '@thxnetwork/api/services/PoolService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import MailService from '@thxnetwork/api/services/MailService';
import SafeService from '@thxnetwork/api/services/SafeService';
import PerkService from '@thxnetwork/api/services/PerkService';
import WebhookService from '@thxnetwork/api/services/WebhookService';

const validation = [param('uuid').exists()];

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const customReward = await CustomReward.findOne({ uuid: req.params.uuid });
    if (!customReward) throw new NotFoundError('Could not find this reward');
    if (!customReward.pointPrice) throw new NotFoundError('No point price for this reward has been set.');

    const account = await AccountProxy.findById(req.auth.sub);
    const participant = await Participant.findOne({ sub: account.sub, poolId: pool._id });
    if (!participant || Number(participant.balance) < Number(customReward.pointPrice)) {
        throw new BadRequestError('Not enough points on this account for this payment');
    }

    const redeemValidationResult = await PerkService.validate({ perk: customReward, account, pool });
    if (redeemValidationResult.isError) {
        throw new ForbiddenError(redeemValidationResult.errorMessage);
    }

    const webhook = await Webhook.findById(customReward.webhookId);
    if (!webhook) throw new NotFoundError('Could not find the webhook for this reward');

    await WebhookService.create(webhook, req.auth.sub, {
        type: Event.RewardCustomPayment,
        data: { customRewardId: customReward._id, metadata: customReward.metadata },
    });

    const wallet = await SafeService.findPrimary(account.sub, pool.chainId);
    const customRewardPayment = await CustomRewardPayment.create({
        perkId: customReward.id,
        sub: req.auth.sub,
        walletId: wallet._id,
        poolId: customReward.poolId,
        amount: customReward.pointPrice,
    });

    await PointBalanceService.subtract(pool, account, customReward.pointPrice);

    let html = `<p style="font-size: 18px">Congratulations!🚀</p>`;
    html += `<p>Your point redemption has been received and a custom reward has been created for you!</p>`;
    html += `<p class="btn"><a href="${pool.campaignURL}">View Wallet</a></p>`;

    await MailService.send(account.email, `🎁 Custom Reward Received!"`, html);

    res.status(201).json({ customRewardPayment });
};

export default { controller, validation };
