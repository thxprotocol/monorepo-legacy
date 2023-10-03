import { Request, Response } from 'express';
import { param } from 'express-validator';
import { CouponCode, CouponCodeDocument } from '@thxnetwork/api/models/CouponCode';
import { CouponRewardPayment } from '@thxnetwork/api/models/CouponRewardPayment';
import { CouponReward } from '@thxnetwork/api/models/CouponReward';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const codes = await CouponCode.find({ couponRewardId: req.params.id });
    const payments = await CouponRewardPayment.find({ rewardId: req.params.id });

    const ids = codes
        // Only return codes that are not part of a payment
        .filter((code: CouponCodeDocument) => !payments.find((p) => p.couponCodeId === String(code._id)))
        .map((code) => code._id);

    await CouponCode.deleteMany({ _id: ids });
    await CouponReward.findByIdAndDelete(req.params.id);

    res.status(204).end();
};

export default { controller, validation };
