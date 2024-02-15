import { Request, Response } from 'express';
import { param } from 'express-validator';
import { BadRequestError, ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import PointBalanceService from '@thxnetwork/api/services/PointBalanceService';
import PoolService from '@thxnetwork/api/services/PoolService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import MailService from '@thxnetwork/api/services/MailService';
import SafeService from '@thxnetwork/api/services/SafeService';
import PerkService from '@thxnetwork/api/services/PerkService';
import { CouponReward } from '@thxnetwork/api/models/CouponReward';
import { CouponCode } from '@thxnetwork/api/models/CouponCode';
import { CouponRewardPayment } from '@thxnetwork/api/models/CouponRewardPayment';
import { Participant } from '@thxnetwork/api/models/Participant';

const validation = [param('uuid').exists()];

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.header('X-PoolId'));

    const couponReward = await CouponReward.findOne({ uuid: req.params.uuid });
    if (!couponReward) throw new NotFoundError('Could not find this reward');
    if (!couponReward.pointPrice) throw new NotFoundError('No point price for this reward has been set.');

    const account = await AccountProxy.findById(req.auth.sub);
    const participant = await Participant.findOne({ sub: account.sub, poolId: pool._id });
    if (!participant || Number(participant.balance) < Number(couponReward.pointPrice)) {
        throw new BadRequestError('Not enough points on this account for this payment');
    }

    const redeemValidationResult = await PerkService.validate({ perk: couponReward, account, pool });
    if (redeemValidationResult.isError) {
        throw new ForbiddenError(redeemValidationResult.errorMessage);
    }

    const couponCode = await CouponCode.findOne({ couponRewardId: String(couponReward._id), sub: { $exists: false } });
    if (!couponCode) throw new BadRequestError('Not enough coupon codes left.');

    const wallet = await SafeService.findPrimary(account.sub, pool.chainId);

    const couponRewardPayment = await CouponRewardPayment.create({
        couponCodeId: couponCode._id,
        perkId: couponReward.id,
        sub: req.auth.sub,
        walletId: wallet._id,
        poolId: couponReward.poolId,
        amount: couponReward.pointPrice,
    });

    await couponCode.updateOne({ sub: req.auth.sub });
    await PointBalanceService.subtract(pool, account, couponReward.pointPrice);

    let html = `<p style="font-size: 18px">Congratulations!🚀</p>`;
    html += `<p>Your point redemption has been received and a coupon reward has been created for you!</p>`;
    html += `<p class="btn"><a href="${pool.campaignURL}">View Wallet</a></p>`;

    await MailService.send(account.email, `🎁 Coupon Reward Received!"`, html);

    res.status(201).json({ couponRewardPayment });
};

export default { controller, validation };
