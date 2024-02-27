import { Request, Response } from 'express';
import { param } from 'express-validator';
import { CouponCode, CouponCodeDocument, RewardCoupon, RewardCouponPayment } from '@thxnetwork/api/models';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const codes = await CouponCode.find({ questId: req.params.id });
    const payments = await RewardCouponPayment.find({ rewardId: req.params.id });

    const ids = codes
        // Only return codes that are not part of a payment
        .filter((code: CouponCodeDocument) => !payments.find((p) => p.couponCodeId === String(code._id)))
        .map((code) => code._id);

    await RewardCoupon.findByIdAndDelete(req.params.id);

    res.status(204).end();
};

export default { controller, validation };
