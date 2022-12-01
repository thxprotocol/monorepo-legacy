import { Request, Response } from 'express';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const referralRewards = await ReferralReward.find({ poolId: req.assetPool._id });
    const pointRewards = await PointReward.find({ poolId: req.assetPool._id });

    res.json({
        referralRewards: referralRewards.map((r) => {
            return {
                uuid: r.uuid,
                title: r.title,
                description: r.description,
                amount: r.amount,
            };
        }),
        pointRewards: pointRewards.map((r) => {
            return {
                uuid: r.uuid,
                title: r.title,
                description: r.description,
                amount: r.amount,
                platform: r.platform,
                interaction: r.interaction,
                content: r.content,
            };
        }),
    });
};

export default { controller };
