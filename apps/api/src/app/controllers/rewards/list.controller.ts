import { Request, Response } from 'express';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import PoolService from '@thxnetwork/api/services/PoolService';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const referralRewards = await ReferralReward.find({ poolId: pool._id });
    const pointRewards = await PointReward.find({ poolId: pool._id });

    res.json({
        referralRewards: referralRewards.map((r) => {
            return {
                _id: r._id,
                uuid: r.uuid,
                title: r.title,
                description: r.description,
                amount: r.amount,
                successUrl: r.successUrl,
            };
        }),
        pointRewards: pointRewards.map((r) => {
            return {
                _id: r._id,
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
