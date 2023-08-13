import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import mongoose, { Model } from 'mongoose';
import { Claim } from '@thxnetwork/api/models/Claim';
import { DailyRewardDocument } from '@thxnetwork/api/models/DailyReward';
import { ERC20PerkDocument, ERC20Perk } from '@thxnetwork/api/models/ERC20Perk';
import { ERC721PerkDocument, ERC721Perk } from '@thxnetwork/api/models/ERC721Perk';
import { MilestoneRewardDocument, MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import { PointRewardDocument } from '@thxnetwork/api/models/PointReward';
import { ReferralRewardDocument, ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import { DailyReward } from './DailyRewardService';
import { PointReward } from './PointRewardService';
import AccountProxy from '../proxies/AccountProxy';
import { ERC20PerkPayment } from '@thxnetwork/api/models/ERC20PerkPayment';
import { DailyRewardClaim } from '@thxnetwork/api/models/DailyRewardClaims';
import { ERC721PerkPayment } from '@thxnetwork/api/models/ERC721PerkPayment';
import { MilestoneRewardClaim } from '@thxnetwork/api/models/MilestoneRewardClaims';
import { PointRewardClaim } from '@thxnetwork/api/models/PointRewardClaim';
import { ReferralRewardClaim } from '@thxnetwork/api/models/ReferralRewardClaim';
import { Wallet, WalletDocument } from '@thxnetwork/api/models/Wallet';
import { TAccount } from '@thxnetwork/types/interfaces';

export async function getPoolAnalyticsForChart(pool: AssetPoolDocument, startDate: Date, endDate: Date) {
    const erc20PerksQueryResult = await runPoolChartQuery<ERC20PerkDocument>({
        joinTable: 'erc20perkpayments',
        key: 'perkId',
        model: ERC20Perk,
        poolId: String(pool._id),
        amountField: 'pointPrice',
        startDate,
        endDate,
    });
    const erc721PerksQueryResult = await runPoolChartQuery<ERC721PerkDocument>({
        joinTable: 'erc721perkpayments',
        key: 'perkId',
        model: ERC721Perk,
        poolId: String(pool._id),
        amountField: 'pointPrice',
        startDate,
        endDate,
    });
    const milestoneRewardsQueryResult = await runPoolChartQuery<MilestoneRewardDocument>({
        joinTable: 'milestonerewardclaims',
        key: 'milestoneRewardId',
        model: MilestoneReward,
        poolId: String(pool._id),
        amountField: 'amount',
        startDate,
        endDate,
        extraFilter: { isClaimed: true },
    });
    const referralRewardsQueryResult = await runPoolChartQuery<ReferralRewardDocument>({
        joinTable: 'referralrewardclaims',
        key: 'referralRewardId',
        model: ReferralReward,
        poolId: String(pool._id),
        amountField: 'amount',
        startDate,
        endDate,
        extraFilter: { isApproved: true },
    });
    const pointRewardsQueryResult = await runPoolChartQuery<PointRewardDocument>({
        joinTable: 'pointrewardclaims',
        key: 'pointRewardId',
        model: PointReward,
        poolId: String(pool._id),
        amountField: 'amount',
        startDate,
        endDate,
    });
    const dailyRewardsQueryResult = await runPoolChartQuery<DailyRewardDocument>({
        joinTable: 'dailyrewardclaims',
        key: 'dailyRewardId',
        model: DailyReward,
        poolId: String(pool._id),
        amountField: 'amount',
        startDate,
        endDate,
    });

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
    };
    return result;
}

export async function getPoolMetrics(pool: AssetPoolDocument, dateRange?: { startDate: Date; endDate: Date }) {
    const collections = [
        DailyRewardClaim,
        PointRewardClaim,
        ReferralRewardClaim,
        MilestoneRewardClaim,
        ERC20PerkPayment,
        ERC721PerkPayment,
    ];
    const [dailyQuest, socialQuest, inviteQuest, customQuest, coinReward, nftReward] = await Promise.all(
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
            const totalCreated = await Model.countDocuments($match as any);

            return { ...result, totalCreated };
        }),
    );

    return { dailyQuest, socialQuest, inviteQuest, customQuest, coinReward, nftReward };
}

export async function getLeaderboard(pool: AssetPoolDocument, dateRange?: { startDate: Date; endDate: Date }) {
    const collections = [DailyRewardClaim, PointRewardClaim, ReferralRewardClaim, MilestoneRewardClaim];
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

    const walletIds = Object.keys(walletTotals);
    const wallets = await Wallet.find({ _id: walletIds });
    const subs = wallets.map((w: WalletDocument) => w.sub);
    const accounts = await AccountProxy.getMany(subs);

    return accounts
        .map((account: TAccount) => {
            const wallet = wallets.find((w) => w.sub === account.sub);
            const walletId = String(wallet._id);

            return {
                questsCompleted: walletTotals[walletId].totalCompleted,
                sub: wallet.sub,
                walletId,
                score: walletTotals[walletId].totalAmount,
                wallet,
                account: { ...account, address: wallet.address },
            };
        })
        .sort((a: any, b: any) => b[1].totalAmount - a[1].totalAmount)
        .slice(0, 10);
}

/**
 *
 * @returns the rewards per poolId, with the claims for each reward,
 * filtered by a time range,
 * grouped by day of claim creation
 * with the total claims per reward
 * and the sum of the reward amount * total claims per reward per day
 */
async function runPoolChartQuery<T>(args: {
    model: mongoose.Model<T>;
    poolId: string;
    joinTable: string;
    key: string;
    amountField: string;
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
                from: args.joinTable,
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
                as: 'claims',
            },
        },
        {
            $unwind: '$claims',
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: '%Y-%m-%d',
                        date: { $toDate: '$claims.createdAt' },
                    },
                },
                paymentsCount: {
                    $count: {},
                },
                total_amount: {
                    $sum: {
                        $convert: {
                            input: `$${args.amountField}`,
                            to: 'int',
                        },
                    },
                },
            },
        },
    ]);

    return queryResult;
}
