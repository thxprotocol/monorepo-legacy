import mongoose from 'mongoose';
import { RewardCoinDocument, RewardCoin } from '@thxnetwork/api/models/RewardCoin';
import { RewardNFTDocument, RewardNFT } from '@thxnetwork/api/models/RewardNFT';
import { QuestInviteDocument, QuestInvite } from '@thxnetwork/api/models/QuestInvite';
import {
    PoolDocument,
    RewardCustomDocument,
    QuestCustomDocument,
    QuestSocialDocument,
    QuestWeb3Document,
    QuestWeb3,
    QuestSocialEntry,
    QuestInviteEntry,
    QuestWeb3Entry,
    RewardCoinPayment,
    RewardNFTPayment,
    WalletDocument,
    Participant,
    RewardCouponDocument,
    RewardCustom,
    RewardDiscordRoleDocument,
    RewardCouponPayment,
    RewardCustomPayment,
    RewardDiscordRolePayment,
    RewardCoupon,
    RewardDiscordRole,
    QuestCustomEntry,
    QuestDailyEntry,
    QuestCustom,
    QuestSocial,
    QuestDailyDocument,
    QuestDaily,
    QuestGitcoin,
    QuestGitcoinEntry,
    Wallet,
    RewardGalachainDocument,
    RewardGalachain,
    QuestGitcoinDocument,
    RewardGalachainPayment,
} from '@thxnetwork/api/models';

async function getPoolAnalyticsForChart(pool: PoolDocument, startDate: Date, endDate: Date) {
    // Rewards
    const [
        erc20PerksQueryResult,
        erc721PerksQueryResult,
        customRewardsQueryResult,
        couponRewardsQueryResult,
        discordRoleRewardsQueryResult,
        galachainRewardsQueryResult,
    ] = await Promise.all([
        queryRewardRedemptions<RewardCoinDocument>({
            collectionName: 'rewardcoinpayment',
            key: 'rewardId',
            model: RewardCoin,
            poolId: String(pool._id),
            startDate,
            endDate,
        }),
        queryRewardRedemptions<RewardNFTDocument>({
            collectionName: 'rewardnftpayment',
            key: 'rewardId',
            model: RewardNFT,
            poolId: String(pool._id),
            startDate,
            endDate,
        }),
        queryRewardRedemptions<RewardCustomDocument>({
            collectionName: 'rewardcustompayment',
            key: 'rewardId',
            model: RewardCustom,
            poolId: String(pool._id),
            startDate,
            endDate,
        }),
        queryRewardRedemptions<RewardCouponDocument>({
            collectionName: 'rewardcouponpayment',
            key: 'rewardId',
            model: RewardCoupon,
            poolId: String(pool._id),
            startDate,
            endDate,
        }),
        queryRewardRedemptions<RewardDiscordRoleDocument>({
            collectionName: 'rewarddiscordrolepayment',
            key: 'rewardId',
            model: RewardDiscordRole,
            poolId: String(pool._id),
            startDate,
            endDate,
        }),
        queryRewardRedemptions<RewardGalachainDocument>({
            collectionName: 'rewargalachainpayment',
            key: 'rewardId',
            model: RewardGalachain,
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
        gitcoinQuestsQueryResult,
    ] = await Promise.all([
        queryQuestEntries<QuestCustomDocument>({
            collectionName: 'questcustomentry',
            key: 'questId',
            model: QuestCustom,
            poolId: String(pool._id),
            startDate,
            endDate,
            extraFilter: { isClaimed: true },
        }),
        queryQuestEntries<QuestInviteDocument>({
            collectionName: 'questinviteentry',
            key: 'questId',
            model: QuestInvite,
            poolId: String(pool._id),
            startDate,
            endDate,
            extraFilter: { isApproved: true },
        }),
        queryQuestEntries<QuestSocialDocument>({
            collectionName: 'questsocialentry',
            key: 'questId',
            model: QuestSocial,
            poolId: String(pool._id),
            startDate,
            endDate,
        }),
        queryQuestEntries<QuestDailyDocument>({
            collectionName: 'questdailyentry',
            key: 'questId',
            model: QuestDaily,
            poolId: String(pool._id),
            startDate,
            endDate,
        }),
        queryQuestEntries<QuestWeb3Document>({
            collectionName: 'questweb3entry',
            key: 'questId',
            model: QuestWeb3,
            poolId: String(pool._id),
            startDate,
            endDate,
        }),
        queryQuestEntries<QuestGitcoinDocument>({
            collectionName: 'questgitcoinentry',
            key: 'questId',
            model: QuestGitcoin,
            poolId: String(pool._id),
            startDate,
            endDate,
        }),
    ]);

    const result = {
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
        galachainRewards: galachainRewardsQueryResult.map((x) => {
            return {
                day: x._id,
                totalAmount: x.total_amount,
            };
        }),
        //
        dailyRewards: dailyRewardsQueryResult.map((x) => {
            return {
                day: x._id,
                totalAmount: x.total_amount,
            };
        }),
        milestoneRewards: milestoneRewardsQueryResult.map((x) => {
            return {
                day: x._id,
                totalAmount: x.total_amount,
            };
        }),
        referralRewards: referralRewardsQueryResult.map((x) => {
            return {
                day: x._id,
                totalAmount: x.total_amount,
            };
        }),
        pointRewards: pointRewardsQueryResult.map((x) => {
            return {
                day: x._id,
                totalAmount: x.total_amount,
            };
        }),
        web3Quests: web3QuestsQueryResult.map((x) => {
            return {
                day: x._id,
                totalAmount: x.total_amount,
            };
        }),
        gitcoinQuests: gitcoinQuestsQueryResult.map((x) => {
            return {
                day: x._id,
                totalAmount: x.total_amount,
            };
        }),
    };
    return result;
}

async function getPoolMetrics(pool: PoolDocument, dateRange?: { startDate: Date; endDate: Date }) {
    const collections = [
        QuestDailyEntry,
        QuestSocialEntry,
        QuestInviteEntry,
        QuestCustomEntry,
        QuestWeb3Entry,
        QuestGitcoinEntry,
        RewardCoinPayment,
        RewardNFTPayment,
        RewardCustomPayment,
        RewardCouponPayment,
        RewardDiscordRolePayment,
        RewardGalachainPayment,
    ];
    const [
        dailyQuest,
        socialQuest,
        inviteQuest,
        customQuest,
        web3Quest,
        gitcoinQuest,
        coinReward,
        nftReward,
        customReward,
        couponReward,
        discordRoleReward,
        galachainReward,
    ] = await Promise.all(
        collections.map(async (Model) => {
            const $match = { poolId: String(pool._id) };
            if (dateRange) {
                $match['createdAt'] = { $gte: dateRange.startDate, $lte: dateRange.endDate };
            }

            // Extend the $match filter with model specific properties
            switch (Model) {
                case QuestDailyEntry:
                    $match['state'] = 1;
                    break;
                case QuestCustomEntry:
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
        gitcoinQuest,
        coinReward,
        nftReward,
        customReward,
        couponReward,
        discordRoleReward,
        galachainReward,
    };
}

async function createLeaderboard(pool: PoolDocument, dateRange?: { startDate: Date; endDate: Date }) {
    const collections = [
        QuestDailyEntry,
        QuestSocialEntry,
        QuestInviteEntry,
        QuestCustomEntry,
        QuestWeb3Entry,
        QuestGitcoinEntry,
    ];
    const result = await Promise.all(
        collections.map(async (Model) => {
            const $match = { poolId: String(pool._id) };

            // Extend the $match filter with optional dateRange
            if (dateRange) {
                $match['createdAt'] = { $gte: dateRange.startDate, $lte: dateRange.endDate };
            }

            // Extend the $match filter with model specific properties
            switch (Model) {
                case QuestDailyEntry:
                    $match['state'] = 1;
                    break;
                case QuestCustomEntry:
                    $match['isClaimed'] = true;
                    break;
            }

            const $group = {
                _id: '$sub',
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
                total_amount: {
                    $sum: 1,
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
                total_amount: {
                    $sum: 1,
                },
            },
        },
    ]);

    return queryResult;
}
export default { getPoolMetrics, createLeaderboard, getPoolAnalyticsForChart };
