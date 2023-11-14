import jwt_decode from 'jwt-decode';
import { Request, Response } from 'express';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import { MilestoneRewardClaim } from '@thxnetwork/api/models/MilestoneRewardClaims';
import { PointRewardClaim } from '@thxnetwork/api/models/PointRewardClaim';
import { DailyReward } from '@thxnetwork/api/models/DailyReward';
import { WalletDocument } from '@thxnetwork/api/models/Wallet';
import { Web3Quest } from '@thxnetwork/api/models/Web3Quest';
import { Web3QuestClaim } from '@thxnetwork/api/models/Web3QuestClaim';
import { TAccount, TBaseReward } from '@thxnetwork/types/interfaces';
import AnalyticsService from '@thxnetwork/api/services/AnalyticsService';
import PoolService from '@thxnetwork/api/services/PoolService';
import DailyRewardClaimService, { ONE_DAY_MS } from '@thxnetwork/api/services/DailyRewardClaimService';
import WalletService from '@thxnetwork/api/services/WalletService';
import DiscordMessage from '@thxnetwork/api/models/DiscordMessage';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { AccessTokenKind, RewardConditionInteraction } from '@thxnetwork/common/lib/types';

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
    const models = [ReferralReward, PointReward, MilestoneReward, DailyReward, Web3Quest];
    const [inviteQuests, socialQuests, customQuests, dailyQuests, web3Quests] = await Promise.all(
        models.map(async (model: any) => await model.find(query)),
    );
    const authHeader = req.header('authorization');

    let wallet: WalletDocument, sub: string, account: TAccount;
    // This endpoint is public so we do not get req.auth populated and decode the token ourselves
    // when the request is made with an authorization header to obtain the sub.
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token: { sub: string } = jwt_decode(authHeader.split(' ')[1]);
        sub = token.sub;
        account = await AccountProxy.getById(sub);
        wallet = await WalletService.findPrimary(sub, pool.chainId);
    }

    const leaderboard = await AnalyticsService.getLeaderboard(pool, {
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

    res.json({
        leaderboard: leaderboard.slice(0, 10).map(({ score, questsCompleted, account }) => ({
            questsCompleted,
            score,
            account: {
                username: account.username,
                profileImg: account.profileImg,
            },
        })),
        daily: await Promise.all(
            dailyQuests.map(async (r) => {
                const isDisabled = wallet ? !(await DailyRewardClaimService.isClaimable(r, wallet)) : true;
                const validClaims = wallet ? await DailyRewardClaimService.findByWallet(r, wallet) : [];
                const claimAgainTime = validClaims.length
                    ? new Date(validClaims[0].createdAt).getTime() + ONE_DAY_MS
                    : null;
                const now = Date.now();
                const defaults = getDefaults(r);
                const amountIndex =
                    validClaims.length >= r.amounts.length ? validClaims.length % r.amounts.length : validClaims.length;
                const amount = r.amounts[amountIndex];

                return {
                    ...defaults,
                    amount,
                    amounts: r.amounts,
                    isDisabled,
                    claims: validClaims,
                    claimAgainDuration:
                        claimAgainTime && claimAgainTime - now > 0 ? Math.floor((claimAgainTime - now) / 1000) : null, // Convert and floor to S,
                };
            }),
        ),
        custom: await Promise.all(
            customQuests.map(async (r) => {
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
            }),
        ),
        invite: inviteQuests.map((r) => {
            const defaults = getDefaults(r);
            return {
                ...defaults,
                amount: r.amount,
                pathname: r.pathname,
                successUrl: r.successUrl,
            };
        }),
        social: await Promise.all(
            socialQuests.map(async (r) => {
                const defaults = getDefaults(r);
                let isClaimed = wallet
                    ? await PointRewardClaim.exists({
                          $or: [{ walletId: wallet._id }, { sub }],
                          pointRewardId: String(r._id),
                      }) // TODO SHould move to service since its also used in the claim controller
                    : false;

                // Discord Quest Details
                let messages = [];
                let amountAvailable = r.amount;

                const startOfWeek = new Date();
                startOfWeek.setUTCHours(0, 0, 0, 0);
                startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(endOfWeek.getDate() + 7);

                if (account && r.interaction === RewardConditionInteraction.DiscordMessage) {
                    const contentMetadata = JSON.parse(r.contentMetadata);
                    const connectedAccount = account.connectedAccounts.find(
                        ({ kind }) => kind === AccessTokenKind.Discord,
                    );

                    if (connectedAccount) {
                        messages = await DiscordMessage.find({
                            guildId: r.content,
                            memberId: connectedAccount.userId,
                            createdAt: { $gt: startOfWeek, $lt: endOfWeek },
                        });
                    }
                    isClaimed = false;
                    amountAvailable = Math.ceil(
                        messages.length * (r.amount / (contentMetadata.limit * contentMetadata.days)),
                    );
                }

                return {
                    ...defaults,
                    amount: r.amount,
                    isClaimed,
                    platform: r.platform,
                    interaction: r.interaction,
                    content: r.content,
                    contentMetadata: r.contentMetadata,
                    amountAvailable,
                    messages,
                    startOfWeek,
                    endOfWeek,
                };
            }),
        ),
        web3: await Promise.all(
            web3Quests.map(async (r) => {
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
            }),
        ),
    });
};

export default { controller };
