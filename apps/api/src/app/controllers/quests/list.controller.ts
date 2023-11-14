import jwt_decode from 'jwt-decode';
import { Request, Response } from 'express';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import { MilestoneRewardClaim } from '@thxnetwork/api/models/MilestoneRewardClaims';
import { DailyReward } from '@thxnetwork/api/models/DailyReward';
import { WalletDocument } from '@thxnetwork/api/models/Wallet';
import { Web3Quest } from '@thxnetwork/api/models/Web3Quest';
import { Web3QuestClaim } from '@thxnetwork/api/models/Web3QuestClaim';
import { TAccount, TBaseReward } from '@thxnetwork/types/interfaces';
import AnalyticsService from '@thxnetwork/api/services/AnalyticsService';
import PoolService from '@thxnetwork/api/services/PoolService';
import DailyRewardClaimService, { ONE_DAY_MS } from '@thxnetwork/api/services/DailyRewardClaimService';
import WalletService from '@thxnetwork/api/services/WalletService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import PointRewardService from '@thxnetwork/api/services/PointRewardService';
import DailyRewardService from '@thxnetwork/api/services/DailyRewardService';
import { PointRewardClaim } from '@thxnetwork/api/models/PointRewardClaim';
import { AccessTokenKind, RewardConditionInteraction } from '@thxnetwork/common/lib/types';
import DiscordMessage from '@thxnetwork/api/models/DiscordMessage';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const query = {
        poolId: pool._id,
        isPublished: true,
        $or: [
            { expiryDate: { $exists: true, $gte: new Date() } }, // Include rewards with expiryDate less than or equal to now
            { expiryDate: { $exists: false } }, // Include quests with no expiryDate
        ],
    };
    const authHeader = req.header('authorization');
    const models = [ReferralReward, PointReward, MilestoneReward, DailyReward, Web3Quest];
    const [inviteQuests, socialQuests, customQuests, dailyQuests, web3Quests] = await Promise.all(
        models.map(async (model: any) => await model.find(query)),
    );

    let wallet: WalletDocument, sub: string, account: TAccount;

    // This endpoint is public so we do not get req.auth populated and decode the token ourselves
    // when the request is made with an authorization header to obtain the sub.
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token: { sub: string } = jwt_decode(authHeader.split(' ')[1]);
        sub = token.sub;
        account = await AccountProxy.getById(sub);
        wallet = await WalletService.findPrimary(sub, pool.chainId);
    }

    const leaderboardEntries = await AnalyticsService.getLeaderboard(pool, {
        startDate: new Date(pool.createdAt),
        endDate: new Date(),
    });

    const getDefaults = ({ _id, index, title, description, infoLinks, uuid, image, expiryDate }: TBaseReward) => ({
        _id,
        index,
        title,
        description,
        infoLinks,
        image,
        uuid,
        expiryDate,
    });

    const dailyQuestPromises = dailyQuests.map(async (r) => {
        const isDisabled = wallet ? !(await DailyRewardClaimService.isClaimable(r, wallet)) : true;
        const validClaims = wallet ? await DailyRewardClaimService.findByWallet(r, wallet) : [];
        const claimAgainTime = validClaims.length ? new Date(validClaims[0].createdAt).getTime() + ONE_DAY_MS : null;
        const now = Date.now();
        const defaults = getDefaults(r);
        const pointsAvailable = await DailyRewardService.getPointsAvailable(r, validClaims);

        return {
            ...defaults,
            amounts: r.amounts,
            pointsAvailable,
            isDisabled,
            claims: validClaims,
            claimAgainDuration:
                claimAgainTime && claimAgainTime - now > 0 ? Math.floor((claimAgainTime - now) / 1000) : null, // Convert and floor to S,
        };
    });
    const customQuestPromises = customQuests.map(async (r) => {
        const claims = wallet
            ? await MilestoneRewardClaim.find({
                  walletId: String(wallet._id),
                  milestoneRewardId: String(r._id),
              })
            : [];
        const defaults = getDefaults(r);
        return {
            ...defaults,
            amount: r.amount,
            claims,
        };
    });
    const inviteQuestPromises = inviteQuests.map((r) => {
        const defaults = getDefaults(r);
        return {
            ...defaults,
            amount: r.amount,
            pathname: r.pathname,
            successUrl: r.successUrl,
        };
    });
    const socialQuestPromises = socialQuests.map(async (r) => {
        const defaults = getDefaults(r);
        const isClaimed = wallet ? await PointRewardService.isCompleted(r, account, wallet) : false;
        const restartDates = PointRewardService.getRestartDates(r);
        const { messages, pointsAvailable } = await PointRewardService.getPointsAvailable(r, account);

        return {
            ...defaults,
            amount: r.amount,
            platform: r.platform,
            interaction: r.interaction,
            content: r.content,
            contentMetadata: r.contentMetadata,
            pointsAvailable,
            isClaimed,
            restartDates,
            messages,
        };
    });
    const web3QuestPromises = web3Quests.map(async (r) => {
        const isClaimed = wallet
            ? await Web3QuestClaim.exists({
                  web3QuestId: r._id,
                  $or: [{ sub }, { walletId: wallet._id }],
              })
            : false;
        const defaults = getDefaults(r);
        return {
            ...defaults,
            amount: r.amount,
            contracts: r.contracts,
            methodName: r.methodName,
            threshold: r.threshold,
            isClaimed,
        };
    });

    const [daily, custom, invite, social, web3] = await Promise.all([
        await Promise.all(dailyQuestPromises),
        await Promise.all(customQuestPromises),
        await Promise.all(inviteQuestPromises),
        await Promise.all(socialQuestPromises),
        await Promise.all(web3QuestPromises),
    ]);

    const leaderboard = leaderboardEntries.slice(0, 10).map(({ score, questsCompleted, account }) => ({
        questsCompleted,
        score,
        account: {
            username: account.username,
            profileImg: account.profileImg,
        },
    }));

    res.json({
        leaderboard,
        daily,
        custom,
        invite,
        social,
        web3,
    });
};

export default { controller };
