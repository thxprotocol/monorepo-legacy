import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';
import RewardReferralService from '@thxnetwork/api/services/ReferralRewardService';
import { ReferralRewardClaimDocument } from '@thxnetwork/api/services/ReferralRewardClaimService';
import db from '@thxnetwork/api/util/database';

const validation = [param('id').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards Referral']
    const reward = await RewardReferralService.get(req.params.id);
    if (!reward) throw new NotFoundError();

    const claim = await ReferralRewardClaimDocument.findOne({ referralRewardId: reward._id, sub: req.auth.sub });
    if (!claim) {
        await claim.updateOne(
            { referralRewardId: reward._id, sub: req.auth.sub, uuid: db.createUUID() },
            { upsert: true },
        );
    }

    res.json({
        ...reward.toJSON(),
        claims: [claim],
        poolAddress: req.assetPool.address,
    });
};

export default { controller, validation };
