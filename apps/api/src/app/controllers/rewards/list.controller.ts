import { Request, Response } from 'express';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import PoolService from '@thxnetwork/api/services/PoolService';
import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import jwt_decode from 'jwt-decode';
import { MilestoneRewardClaim } from '@thxnetwork/api/models/MilestoneRewardClaims';
import { PointRewardClaim } from '@thxnetwork/api/models/PointRewardClaim';
import { DailyReward } from '@thxnetwork/api/models/DailyReward';
import DailyRewardClaimService from '@thxnetwork/api/services/DailyRewardClaimService';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const referralRewards = await ReferralReward.find({ poolId: pool._id });
    const pointRewards = await PointReward.find({ poolId: pool._id });
    const milestoneRewards = await MilestoneReward.find({ poolId: pool._id });
    const dailyRewards = await DailyReward.find({ poolId: pool._id });
    const authHeader = req.header('authorization');

    let sub = '';
    // This endpoint is public so we do not get req.auth populated and decode the token ourselves
    // when the request is made with an authorization header to obtain the sub.
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token: { sub: string } = jwt_decode(authHeader.split(' ')[1]);
        sub = token.sub;
    }

    res.json({
        dailyRewards: await Promise.all(
            dailyRewards.map(async (r) => {
                const isClaimed = sub ? await DailyRewardClaimService.isClaimed(r.poolId, sub) : false;
                return {
                    uuid: r.uuid,
                    title: r.title,
                    description: r.description,
                    amount: r.amount,
                    isClaimed,
                };
            }),
        ),
        milestoneRewards: await Promise.all(
            milestoneRewards.map(async (r) => {
                const claims = sub ? await MilestoneRewardClaim.find({ sub, milestoneRewardId: String(r._id) }) : [];
                return {
                    uuid: r.uuid,
                    title: r.title,
                    description: r.description,
                    amount: r.amount,
                    claims,
                };
            }),
        ),
        referralRewards: referralRewards.map((r) => {
            return {
                uuid: r.uuid,
                title: r.title,
                description: r.description,
                amount: r.amount,
                successUrl: r.successUrl,
            };
        }),
        pointRewards: await Promise.all(
            pointRewards.map(async (r) => {
                const isClaimed = sub ? await PointRewardClaim.exists({ sub, pointRewardId: String(r._id) }) : false;
                return {
                    uuid: r.uuid,
                    title: r.title,
                    description: r.description,
                    amount: r.amount,
                    isClaimed,
                    platform: r.platform,
                    interaction: r.interaction,
                    content: r.content,
                };
            }),
        ),
    });
};

export default { controller };
