import { Request, Response } from 'express';
import { CouponRewardPayment } from '@thxnetwork/api/models/CouponRewardPayment';
import SafeService from '@thxnetwork/api/services/SafeService';
import { ChainId } from '@thxnetwork/types/enums';
import { query } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { CouponCode } from '@thxnetwork/api/models/CouponCode';
import { CouponReward } from '@thxnetwork/api/models/CouponReward';

const validation = [query('chainId').exists().isNumeric()];

const controller = async (req: Request, res: Response) => {
    const chainId = Number(req.query.chainId) as ChainId;
    const wallet = await SafeService.findPrimary(req.auth.sub, chainId);
    if (!wallet) throw new NotFoundError('Could not find the wallet for the user');

    const couponRewardPayments = await CouponRewardPayment.find({ walletId: wallet._id });
    const promises = couponRewardPayments.map(async (p) => {
        const couponCode = await CouponCode.findById(p.couponCodeId);
        const reward = couponCode ? await CouponReward.findById(couponCode.couponRewardId) : null;
        return { ...p.toJSON(), code: couponCode.code, webshopURL: reward && reward.webshopURL };
    });
    const results = await Promise.allSettled(promises);
    const couponCodes = results
        .filter((result) => result.status === 'fulfilled')
        .map((result: any & { value: boolean }) => result.value);

    res.json(couponCodes);
};

export default { controller, validation };
