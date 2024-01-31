import mongoose from 'mongoose';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { DailyRewardDocument } from '@thxnetwork/api/models/DailyReward';
import { ERC20PerkDocument, ERC20Perk } from '@thxnetwork/api/models/ERC20Perk';
import { ERC721PerkDocument, ERC721Perk } from '@thxnetwork/api/models/ERC721Perk';
import { MilestoneRewardDocument, MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import { PointRewardDocument } from '@thxnetwork/api/models/PointReward';
import { ReferralRewardDocument, ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import { DailyReward } from '@thxnetwork/api/models/DailyReward';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import { ERC20PerkPayment } from '@thxnetwork/api/models/ERC20PerkPayment';
import { DailyRewardClaim } from '@thxnetwork/api/models/DailyRewardClaims';
import { ERC721PerkPayment } from '@thxnetwork/api/models/ERC721PerkPayment';
import { MilestoneRewardClaim } from '@thxnetwork/api/models/MilestoneRewardClaims';
import { PointRewardClaim } from '@thxnetwork/api/models/PointRewardClaim';
import { ReferralRewardClaim } from '@thxnetwork/api/models/ReferralRewardClaim';
import { Wallet, WalletDocument } from '@thxnetwork/api/models/Wallet';
import { CustomReward, CustomRewardDocument } from '../models/CustomReward';
import { Web3Quest, Web3QuestDocument } from '../models/Web3Quest';
import { Web3QuestClaim } from '../models/Web3QuestClaim';
import { CustomRewardPayment } from '../models/CustomRewardPayment';
import { DiscordRoleRewardPayment } from '../models/DiscordRoleRewardPayment';
import { CouponRewardPayment } from '../models/CouponRewardPayment';
import { Participant } from '../models/Participant';
import { DiscordRoleReward, DiscordRoleRewardDocument } from '../models/DiscordRoleReward';
import { CouponReward, CouponRewardDocument } from '../models/CouponReward';

async function getPoolAnalyticsForChart(pool: AssetPoolDocument, startDate: Date, endDate: Date) {
    // Rewards
    const [
        erc20PerksQueryResult,
        erc721PerksQueryResult,
        customRewardsQueryResult,
        couponRewardsQueryResult,
        discordRoleRewardsQueryResult,
    ] = await Promise.all([
        queryRewardRedemptions<ERC20PerkDocument>({
            collectionName: 'erc20perkpayments',
            key: 'perkId',
            model: ERC20Perk,
            poolId: String(pool._id),
            startDate,
            endDate,
        }),
        queryRewardRedemptions<ERC721PerkDocument>({
            collectionName: 'erc721perkpayments',
            key: 'perkId',
            model: ERC721Perk,
            poolId: String(pool._id),
            startDate,
            endDate,
        }),
        queryRewardRedemptions<CustomRewardDocument>({
            collectionName: 'customrewardpayments',
            key: 'perkId',
            model: CustomReward,
            poolId: String(pool._id),
            startDate,
            endDate,
        }),
        queryRewardRedemptions<CouponRewardDocument>({
            collectionName: 'couponrewardpayments',
            key: 'perkId',
            model: CouponReward,
            poolId: String(pool._id),
            startDate,
            endDate,
        }),
        queryRewardRedemptions<DiscordRoleRewardDocument>({
            collectionName: 'discordrolerewardpayments',
            key: 'perkId',
            model: DiscordRoleReward,
            poolId: String(pool._id),
            startDate,
            endDate,
        }),
    ]);

    // Quests
    const [
        milestoneRewardsQueryResult,
        referralRewardsQueryResult,
        pointRewardsQueryResult,
        dailyRewardsQueryResult,
        web3QuestsQueryResult,
    ] = await Promise.all([
        queryQuestEntries<MilestoneRewardDocument>({
            collectionName: 'milestonerewardclaims',
            key: 'questId',
            model: MilestoneReward,
            poolId: String(pool._id),
            startDate,
            endDate,
            extraFilter: { isClaimed: true },
        }),
        queryQuestEntries<ReferralRewardDocument>({
            collectionName: 'referralrewardclaims',
            key: 'referralRewardId',
            model: ReferralReward,
            poolId: String(pool._id),
            startDate,
            endDate,
            extraFilter: { isApproved: true },
        }),
        queryQuestEntries<PointRewardDocument>({
            collectionName: 'pointrewardclaims',
            key: 'questId',
            model: PointReward,
            poolId: String(pool._id),
            startDate,
            endDate,
        }),
        queryQuestEntries<DailyRewardDocument>({
            collectionName: 'dailyrewardclaims',
            key: 'questId',
            model: DailyReward,
            poolId: String(pool._id),
            startDate,
            endDate,
        }),
        queryQuestEntries<Web3QuestDocument>({
            collectionName: 'web3questclaims',
            key: 'questId',
            model: Web3Quest,
            poolId: String(pool._id),
            startDate,
            endDate,
        }),
    ]);

    const result: any = {
        _id: pool._id,
        erc20Perks: erc20PerksQueryResult.map((x) => {
            return {
                day: x._id,
                totalAmount: x.total_amount,
            };
        }),
        erc721Perks: erc721PerksQueryResult.map((x) => {
            return {
                day: x._id,
                totalAmount: x.total_amount,
            };
        }),
        customRewards: customRewardsQueryResult.map((x) => {
            return {
                day: x._id,
                totalAmount: x.total_amount,
            };
        }),
        couponRewards: couponRewardsQueryResult.map((x) => {
            return {
                day: x._id,
                totalAmount: x.total_amount,
            };
        }),
        discordRoleRewards: discordRoleRewardsQueryResult.map((x) => {
            return {
                day: x._id,
                totalAmount: x.total_amount,
            };
        }),
        //
        dailyRewards: dailyRewardsQueryResult.map((x) => {
            return {
                day: x._id,
                totalClaimPoints: x.total_amount,
            };
        }),
        milestoneRewards: milestoneRewardsQueryResult.map((x) => {
            return {
                day: x._id,
                totalClaimPoints: x.total_amount,
            };
        }),
        referralRewards: referralRewardsQueryResult.map((x) => {
            return {
                day: x._id,
                totalClaimPoints: x.total_amount,
            };
        }),
        pointRewards: pointRewardsQueryResult.map((x) => {
            return {
                day: x._id,
                totalClaimPoints: x.total_amount,
            };
        }),
        web3Quests: web3QuestsQueryResult.map((x) => {
            return {
                day: x._id,
                totalClaimPoints: x.total_amount,
            };
        }),
    };
    return result;
}

async function getPoolMetrics(pool: AssetPoolDocument, dateRange?: { startDate: Date; endDate: Date }) {
    const collections = [
        DailyRewardClaim,
        PointRewardClaim,
        ReferralRewardClaim,
        MilestoneRewardClaim,
        Web3QuestClaim,
        ERC20PerkPayment,
        ERC721PerkPayment,
        CustomRewardPayment,
        CouponRewardPayment,
        DiscordRoleRewardPayment,
    ];
    const [
        dailyQuest,
        socialQuest,
        inviteQuest,
        customQuest,
        web3Quest,
        coinReward,
        nftReward,
        customReward,
        couponReward,
        discordRoleReward,
    ] = await Promise.all(
        collections.map(async (Model) => {
            const $match = { poolId: String(pool._id) };
            if (dateRange) {
                $match['createdAt'] = { $gte: dateRange.startDate, $lte: dateRange.endDate };
            }

            // Extend the $match filter with model specific properties
            switch (Model) {
                case DailyRewardClaim:
                    $match['state'] = 1;
                    break;
                case MilestoneRewardClaim:
                    $match['isClaimed'] = true;
                    break;
            }

            const [result] = await Model.aggregate([
                { $match },
                {
                    $group: {
                        _id: '$poolId',
                        totalCompleted: { $sum: 1 },
                        totalAmount: { $sum: { $convert: { input: '$amount', to: 'int' } } },
                    },
                },
            ]);

            const query = { poolId: String(pool._id) };
            if (dateRange) {
                query['createdAt'] = { $gte: dateRange.startDate, $lte: dateRange.endDate };
            }
            const totalCreated = await Model.countDocuments(query as any);

            return {
                totalCompleted: result && result.totalCompleted ? result.totalCompleted : 0,
                totalAmount: result && result.totalAmount ? result.totalAmount : 0,
                totalCreated,
            };
        }),
    );

    return {
        dailyQuest,
        socialQuest,
        inviteQuest,
        customQuest,
        web3Quest,
        coinReward,
        nftReward,
        customReward,
        couponReward,
        discordRoleReward,
    };
}

async function createLeaderboard(pool: AssetPoolDocument, dateRange?: { startDate: Date; endDate: Date }) {
    const collections = [DailyRewardClaim, PointRewardClaim, ReferralRewardClaim, MilestoneRewardClaim, Web3QuestClaim];
    const result = await Promise.all(
        collections.map(async (Model) => {
            const $match = { poolId: String(pool._id) };

            // Extend the $match filter with optional dateRange
            if (dateRange) {
                $match['createdAt'] = { $gte: dateRange.startDate, $lte: dateRange.endDate };
            }

            // Extend the $match filter with model specific properties
            switch (Model) {
                case DailyRewardClaim:
                    $match['state'] = 1;
                    break;
                case MilestoneRewardClaim:
                    $match['isClaimed'] = true;
                    break;
            }

            const $group = {
                _id: '$walletId',
                totalCompleted: { $sum: 1 },
                totalAmount: { $sum: { $convert: { input: '$amount', to: 'int' } } },
            };

            return await Model.aggregate([{ $match }, { $group }]);
        }),
    );

    // Combine results from all collections and calculate overall totals
    const walletTotals = {};
    for (const collectionResults of result) {
        for (const r of collectionResults) {
            if (!r) continue;
            if (walletTotals[r._id]) {
                walletTotals[r._id].totalCompleted += r.totalCompleted;
                walletTotals[r._id].totalAmount += r.totalAmount;
            } else {
                walletTotals[r._id] = {
                    totalCompleted: r.totalCompleted,
                    totalAmount: r.totalAmount,
                };
            }
        }
    }

    const wallets = await Wallet.find({ _id: Object.keys(walletTotals), sub: { $exists: true } });
    const leaderboard = wallets
        .map((wallet: WalletDocument) => ({
            score: walletTotals[wallet._id].totalAmount || 0,
            questEntryCount: walletTotals[wallet._id].totalCompleted || 0,
            sub: wallet.sub,
        }))
        .filter((entry) => entry.score > 0)
        .sort((a: any, b: any) => b.score - a.score);

    const updates = leaderboard.map(
        (entry: { sub: string; score: number; questEntryCount: number }, index: number) => ({
            updateOne: {
                filter: { poolId: String(pool._id), sub: entry.sub },
                update: {
                    $set: {
                        rank: Number(index) + 1,
                        score: entry.score,
                        questEntryCount: entry.questEntryCount,
                    },
                },
            },
        }),
    );

    await Participant.bulkWrite(updates);
}

async function queryQuestEntries<T>(args: {
    model: mongoose.Model<T>;
    poolId: string;
    collectionName: string;
    key: string;
    startDate: Date;
    endDate: Date;
    extraFilter?: object;
}) {
    const extraFilter = args.extraFilter ? { ...args.extraFilter } : {};
    const queryResult = await args.model.aggregate([
        {
            $match: {
                poolId: args.poolId,
            },
        },
        {
            $lookup: {
                from: args.collectionName,
                let: {
                    id: {
                        $convert: {
                            input: '$_id',
                            to: 'string',
                        },
                    },
                },
                pipeline: [
                    {
                        $match: {
                            $and: [
                                {
                                    $expr: {
                                        $eq: ['$$id', `$${args.key}`],
                                    },
                                },
                                {
                                    createdAt: {
                                        $gte: args.startDate,
                                        $lte: args.endDate,
                                    },
                                },
                                extraFilter,
                            ],
                        },
                    },
                ],
                as: 'entries',
            },
        },
        {
            $unwind: '$entries',
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: '%Y-%m-%d',
                        date: { $toDate: '$entries.createdAt' },
                    },
                },
                paymentsCount: {
                    $count: {},
                },
                total_amount: {
                    $sum: {
                        $convert: {
                            input: '$entries.amount',
                            to: 'int',
                        },
                    },
                },
            },
        },
    ]);

    return queryResult;
}

async function queryRewardRedemptions<T>(args: {
    model: mongoose.Model<T>;
    poolId: string;
    collectionName: string;
    key: string;
    startDate: Date;
    endDate: Date;
    extraFilter?: object;
}) {
    const extraFilter = args.extraFilter ? { ...args.extraFilter } : {};
    const queryResult = await args.model.aggregate([
        {
            $match: {
                poolId: args.poolId,
            },
        },
        {
            $lookup: {
                from: args.collectionName,
                let: {
                    id: {
                        $convert: {
                            input: '$_id',
                            to: 'string',
                        },
                    },
                },
                pipeline: [
                    {
                        $match: {
                            $and: [
                                {
                                    $expr: {
                                        $eq: ['$$id', `$${args.key}`],
                                    },
                                },
                                {
                                    createdAt: {
                                        $gte: args.startDate,
                                        $lte: args.endDate,
                                    },
                                },
                                extraFilter,
                            ],
                        },
                    },
                ],
                as: 'entries',
            },
        },
        {
            $unwind: '$entries',
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: '%Y-%m-%d',
                        date: { $toDate: '$entries.createdAt' },
                    },
                },
                paymentsCount: {
                    $count: {},
                },
                total_amount: {
                    $sum: {
                        $convert: {
                            input: '$entries.amount',
                            to: 'int',
                        },
                    },
                },
            },
        },
    ]);

    return queryResult;
}
export default { getPoolMetrics, createLeaderboard, getPoolAnalyticsForChart };
