import { AssetPoolDocument } from '../models/AssetPool';
import mongoose from 'mongoose';
import { Claim } from '../models/Claim';
import { DailyRewardDocument } from '../models/DailyReward';
import { ERC20PerkDocument, ERC20Perk } from '../models/ERC20Perk';
import { ERC721PerkDocument, ERC721Perk } from '../models/ERC721Perk';
import { MilestoneRewardDocument, MilestoneReward } from '../models/MilestoneReward';
import { PointRewardDocument } from '../models/PointReward';
import { ReferralRewardDocument, ReferralReward } from '../models/ReferralReward';
import { DailyReward } from './DailyRewardService';
import { PointReward } from './PointRewardService';
import { IAccount } from '../models/Account';
import AccountProxy from '../proxies/AccountProxy';

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
    const erc20PerksQueryResult = await runQueryPoolMetrics<ERC20PerkDocument>({
        joinTable: 'erc20perkpayments',
        key: 'perkId',
        model: ERC20Perk,
        poolId: String(pool._id),
        amountField: 'pointPrice',
        dateRange,
    });
    const erc721PerksQueryResult = await runQueryPoolMetrics<ERC721PerkDocument>({
        joinTable: 'erc721perkpayments',
        key: 'perkId',
        model: ERC721Perk,
        poolId: String(pool._id),
        amountField: 'pointPrice',
        dateRange,
    });
    const dailyRewardsQueryResult = await runQueryPoolMetrics<DailyRewardDocument>({
        joinTable: 'dailyrewardclaims',
        key: 'dailyRewardId',
        model: DailyReward,
        poolId: String(pool._id),
        amountField: 'amount',
        dateRange,
    });
    const referralRewardsQueryResult = await runQueryPoolMetrics<ReferralRewardDocument>({
        joinTable: 'referralrewardclaims',
        key: 'referralRewardId',
        model: ReferralReward,
        poolId: String(pool._id),
        amountField: 'amount',
        extraFilter: { isApproved: true },
        dateRange,
    });
    const milestoneRewardsQueryResult = await runQueryPoolMetrics<MilestoneRewardDocument>({
        joinTable: 'milestonerewardclaims',
        key: 'milestoneRewardId',
        model: MilestoneReward,
        poolId: String(pool._id),
        amountField: 'amount',
        extraFilter: { isClaimed: true },
        dateRange,
    });
    const pointRewardsQueryResult = await runQueryPoolMetrics<PointRewardDocument>({
        joinTable: 'pointrewardclaims',
        key: 'pointRewardId',
        model: PointReward,
        poolId: String(pool._id),
        amountField: 'amount',
        dateRange,
    });

    const metrics = {
        claims: await Claim.count({ poolId: pool._id }),
        erc20Perks: {
            total: erc20PerksQueryResult.recordsCount,
            payments: erc20PerksQueryResult.claimsCount,
            totalAmount: erc20PerksQueryResult.totalAmount,
        },
        erc721Perks: {
            total: erc721PerksQueryResult.recordsCount,
            payments: erc721PerksQueryResult.claimsCount,
            totalAmount: erc721PerksQueryResult.totalAmount,
        },
        dailyRewards: {
            total: dailyRewardsQueryResult.recordsCount,
            claims: dailyRewardsQueryResult.claimsCount,
            totalClaimPoints: dailyRewardsQueryResult.totalAmount,
        },
        referralRewards: {
            total: referralRewardsQueryResult.recordsCount,
            claims: referralRewardsQueryResult.claimsCount,
            totalClaimPoints: referralRewardsQueryResult.totalAmount,
        },
        pointRewards: {
            total: pointRewardsQueryResult.recordsCount,
            claims: pointRewardsQueryResult.claimsCount,
            totalClaimPoints: pointRewardsQueryResult.totalAmount,
        },
        milestoneRewards: {
            total: milestoneRewardsQueryResult.recordsCount,
            claims: milestoneRewardsQueryResult.claimsCount,
            totalClaimPoints: milestoneRewardsQueryResult.totalAmount,
        },
    };
    return metrics;
}

export async function getLeaderboard(pool: AssetPoolDocument, dateRange?: { startDate: Date; endDate: Date }) {
    // LEADERBOARD
    const topErc20PerksBySub = await runLeaderBoardQuery({
        joinTable: 'erc20perkpayments',
        model: ERC20Perk,
        key: 'perkId',
        poolId: String(pool._id),
        amountField: 'pointPrice',
        dateRange,
    });
    const topErc721PerksBySub = await runLeaderBoardQuery({
        joinTable: 'erc721perkpayments',
        model: ERC721Perk,
        key: 'perkId',
        poolId: String(pool._id),
        amountField: 'pointPrice',
        dateRange,
    });
    const topReferralClaimsBySub = await runLeaderBoardQuery({
        joinTable: 'referralrewardclaims',
        key: 'referralRewardId',
        model: ReferralReward,
        poolId: String(pool._id),
        amountField: 'amount',
        extraFilter: { isApproved: true },
        dateRange,
    });
    const topPointClaimsBySub = await runLeaderBoardQuery({
        joinTable: 'pointrewardclaims',
        model: PointReward,
        key: 'pointRewardId',
        poolId: String(pool._id),
        amountField: 'amount',
        dateRange,
    });
    const topMilestonesClaimsBySub = await runLeaderBoardQuery({
        joinTable: 'milestonerewardclaims',
        model: MilestoneReward,
        key: 'milestoneRewardId',
        poolId: String(pool._id),
        amountField: 'amount',
        extraFilter: { isClaimed: true },
        dateRange,
    });
    type leaderBoardQueryResult = { _id: string; total_amount: number };

    const leaderBoardQueryResultMerged: leaderBoardQueryResult[] = [
        ...topErc20PerksBySub,
        ...topErc721PerksBySub,
        ...topReferralClaimsBySub,
        ...topPointClaimsBySub,
        ...topMilestonesClaimsBySub,
    ];

    const leaderBoard: { sub: string; score: number; account: IAccount }[] = [];
    // Group by sub and sort by highest score
    for (let i = 0; i < leaderBoardQueryResultMerged.length; i++) {
        const data = leaderBoardQueryResultMerged[i];
        const sub = data._id;
        const account = await AccountProxy.getById(sub);
        const address = await account.getAddress(pool.chainId);

        if (i === 0) {
            leaderBoard.push({
                sub,
                score: data.total_amount,
                account: { ...account, address },
            });
        } else {
            const index = leaderBoard.map((x) => x.sub).indexOf(data._id);
            if (index >= 0) {
                leaderBoard[index].score += data.total_amount;
            } else {
                leaderBoard.push({ sub, score: data.total_amount, account: { ...account, address } });
            }
        }
    }
    return leaderBoard.sort((a, b) => b.score - a.score);
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

async function runQueryPoolMetrics<T>(args: {
    model: mongoose.Model<T>;
    poolId: string;
    joinTable: string;
    key: string;
    amountField: string;
    extraFilter?: object;
    dateRange?: { startDate: Date; endDate: Date };
}) {
    const extraFilter = args.extraFilter ? { ...args.extraFilter } : {};
    const dateRange = args.dateRange
        ? {
              createdAt: {
                  $gte: args.dateRange.startDate,
                  $lte: args.dateRange.endDate,
              },
          }
        : {};
    const queryResult = await args.model.aggregate([
        {
            $match: {
                poolId: args.poolId,
            },
        },
        {
            $lookup: {
                from: args.joinTable,
                let: { id: { $convert: { input: '$_id', to: 'string' } } },
                pipeline: [
                    {
                        $match: {
                            $and: [
                                {
                                    $expr: {
                                        $eq: ['$$id', `$${args.key}`],
                                    },
                                },
                                dateRange,
                                extraFilter,
                            ],
                        },
                    },
                ],
                as: 'claims',
            },
        },
        {
            $project: {
                claims_count: { $size: '$claims' },
                total_amount: {
                    $multiply: [
                        { $size: '$claims' },
                        {
                            $convert: {
                                input: `$${args.amountField}`,
                                to: 'int',
                            },
                        },
                    ],
                },
            },
        },
    ]);
    const recordsCount = queryResult.length;
    const claimsCount = recordsCount
        ? queryResult
              .map((x) => x.claims_count)
              .reduce((a, b) => {
                  return a + b;
              })
        : 0;
    const totalAmount = claimsCount
        ? queryResult
              .map((x) => x.total_amount)
              .reduce((a, b) => {
                  return a + b;
              })
        : 0;
    return { recordsCount, claimsCount, totalAmount };
}

/**
 *
 * @returns the claims per poolId,
 * filtered by a poolId,
 * grouped by sub
 * with the total claims per sub
 * and the sum of the reward amount * total claims per reward per sub
 */
async function runLeaderBoardQuery<T>(args: {
    model: mongoose.Model<T>;
    poolId: string;
    joinTable: string;
    key: string;
    amountField: string;
    extraFilter?: object;
    dateRange?: { startDate: Date; endDate: Date };
}) {
    const extraFilter = args.extraFilter ? { ...args.extraFilter } : {};
    const dateRange = args.dateRange
        ? {
              createdAt: {
                  $gte: args.dateRange.startDate,
                  $lte: args.dateRange.endDate,
              },
          }
        : {};
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
                                dateRange,
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
                _id: '$claims.sub',
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
        {
            $sort: {
                total_amount: -1,
            },
        },
        {
            $limit: 5,
        },
    ]);

    return queryResult;
}
