import { Request, Response } from 'express';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const pointRewards = await PointReward.find({ poolId: req.assetPool._id });
    const referralRewards = await ReferralReward.find({ poolId: req.assetPool._id });

    res.json({ pointRewards, referralRewards });
};

export default { controller };
