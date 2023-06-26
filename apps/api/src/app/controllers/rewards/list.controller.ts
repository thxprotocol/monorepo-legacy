import jwt_decode from 'jwt-decode';
import { Request, Response } from 'express';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import { MilestoneRewardClaim } from '@thxnetwork/api/models/MilestoneRewardClaims';
import { PointRewardClaim } from '@thxnetwork/api/models/PointRewardClaim';
import { DailyReward } from '@thxnetwork/api/models/DailyReward';
import { WalletDocument } from '@thxnetwork/api/models/Wallet';
import PoolService from '@thxnetwork/api/services/PoolService';
import DailyRewardClaimService, { ONE_DAY_MS } from '@thxnetwork/api/services/DailyRewardClaimService';
import WalletService from '@thxnetwork/api/services/WalletService';
import { getLeaderboard } from '@thxnetwork/api/services/AnalyticsService';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const referralRewards = await ReferralReward.find({ poolId: pool._id });
    const pointRewards = await PointReward.find({ poolId: pool._id });
    const milestoneRewards = await MilestoneReward.find({ poolId: pool._id });
    const dailyRewards = await DailyReward.find({ poolId: pool._id });
    const authHeader = req.header('authorization');

    let wallet: WalletDocument;
    // This endpoint is public so we do not get req.auth populated and decode the token ourselves
    // when the request is made with an authorization header to obtain the sub.
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token: { sub: string } = jwt_decode(authHeader.split(' ')[1]);
        wallet = await WalletService.findPrimary(token.sub, pool.chainId);
    }

    const leaderboard = await getLeaderboard(pool, { startDate: new Date(pool.createdAt), endDate: new Date() });
    console.log({ leaderboard });

    res.json({
        leaderboard: leaderboard.map(({ score, wallet, questsCompleted }) => ({
            questsCompleted,
            score,
            address: wallet.address,
        })),
        dailyRewards: await Promise.all(
            dailyRewards.map(async (r) => {
                const isDisabled = wallet ? !(await DailyRewardClaimService.isClaimable(r, wallet)) : true;
                const claims = wallet ? await DailyRewardClaimService.findByWallet(r, wallet) : [];
                const claimAgainTime = claims.length
                    ? new Date(claims[claims.length - 1].createdAt).getTime() + ONE_DAY_MS
                    : null;
                const now = Date.now();
                return {
                    _id: r._id,
                    index: r.index,
                    title: r.title,
                    description: r.description,
                    amount: r.amounts[claims.length],
                    amounts: r.amounts,
                    infoLinks: r.infoLinks,
                    isDisabled,
                    claims,
                    claimAgainDuration:
                        claimAgainTime && claimAgainTime - now > 0 ? Math.floor((claimAgainTime - now) / 1000) : null, // Convert and floor to S,
                };
            }),
        ),
        milestoneRewards: await Promise.all(
            milestoneRewards.map(async (r) => {
                const claims = wallet
                    ? await MilestoneRewardClaim.find({
                          walletId: String(wallet._id),
                          milestoneRewardId: String(r._id),
                      })
                    : [];
                return {
                    _id: r._id,
                    index: r.index,
                    title: r.title,
                    description: r.description,
                    amount: r.amount,
                    infoLinks: r.infoLinks,
                    claims,
                };
            }),
        ),
        referralRewards: referralRewards.map((r) => {
            return {
                _id: r._id,
                index: r.index,
                title: r.title,
                description: r.description,
                amount: r.amount,
                infoLinks: r.infoLinks,
                successUrl: r.successUrl,
            };
        }),
        pointRewards: await Promise.all(
            pointRewards.map(async (r) => {
                const isClaimed = wallet
                    ? await PointRewardClaim.exists({ walletId: wallet._id, pointRewardId: String(r._id) })
                    : false;
                return {
                    _id: r._id,
                    index: r.index,
                    title: r.title,
                    description: r.description,
                    amount: r.amount,
                    infoLinks: r.infoLinks,
                    isClaimed,
                    platform: r.platform,
                    interaction: r.interaction,
                    content: r.content,
                    contentMetadata: r.contentMetadata,
                };
            }),
        ),
    });
};

export default { controller };
