import { Request, Response } from 'express';
import { param } from 'express-validator';
import { CouponCode, CouponCodeDocument } from '@thxnetwork/api/models/CouponCode';
import { CouponRewardPayment } from '@thxnetwork/api/models/CouponRewardPayment';
import { CouponReward } from '@thxnetwork/api/models/CouponReward';
import { DiscordRoleReward, DiscordRoleRewardDocument } from '@thxnetwork/api/models/DiscordRoleReward';
import { DiscordRoleRewardPaymentDocument } from '@thxnetwork/api/models/DiscordRoleRewardPayment';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    await DiscordRoleReward.findByIdAndDelete(req.params.id);
    res.status(204).end();
};

export default { controller, validation };
