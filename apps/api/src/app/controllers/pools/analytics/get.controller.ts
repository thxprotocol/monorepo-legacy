import { Request, Response } from 'express';
import { param, query } from 'express-validator';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import PoolService from '@thxnetwork/api/services/PoolService';
import { PointReward, PointRewardDocument } from '@thxnetwork/api/models/PointReward';
import { ERC20Perk, ERC20PerkDocument } from '@thxnetwork/api/models/ERC20Perk';
import { ERC721Perk, ERC721PerkDocument } from '@thxnetwork/api/models/ERC721Perk';
import mongoose from 'mongoose';
import { ReferralReward, ReferralRewardDocument } from '@thxnetwork/api/models/ReferralReward';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { MilestoneReward, MilestoneRewardDocument } from '@thxnetwork/api/models/MilestoneReward';

export const validation = [param('id').isMongoId(), query('startDate').exists(), query('endDate').exists()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);

    if (pool.sub !== req.auth.sub) throw new ForbiddenError('Only the pool owner can access this pool info');
    if (!pool.address) return res.json(pool.toJSON());

    // CHART QUERY
    const startDate = new Date(String(req.query.startDate));
    const endDate = new Date(String(req.query.endDate));

    const erc20PerksQueryResult = await runAggregateQuery<ERC20PerkDocument>({
        joinTable: 'erc20perkpayments',
        key: 'perkId',
        model: ERC20Perk,
        poolId: String(pool._id),
        amountField: 'pointPrice',
        startDate,
        endDate,
    });
    const erc721PerksQueryResult = await runAggregateQuery<ERC721PerkDocument>({
        joinTable: 'erc721perkpayments',
        key: 'perkId',
        model: ERC721Perk,
        poolId: String(pool._id),
        amountField: 'pointPrice',
        startDate,
        endDate,
    });
    const milestoneRewardsQueryResult = await runAggregateQuery<MilestoneRewardDocument>({
        joinTable: 'milestonerewardclaims',
        key: 'milestoneRewardId',
        model: MilestoneReward,
        poolId: String(pool._id),
        amountField: 'amount',
        startDate,
        endDate,
        extraFilter: { isClaimed: true },
    });
    const referralRewardsQueryResult = await runAggregateQuery<ReferralRewardDocument>({
        joinTable: 'referralrewardclaims',
        key: 'referralRewardId',
        model: ReferralReward,
        poolId: String(pool._id),
        amountField: 'amount',
        startDate,
        endDate,
        extraFilter: { isApproved: true },
    });
    const pointRewardsQueryResult = await runAggregateQuery<PointRewardDocument>({
        joinTable: 'pointrewardclaims',
        key: 'pointRewardId',
        model: PointReward,
        poolId: String(pool._id),
        amountField: 'amount',
        startDate,
        endDate,
    });

    // LEADERBOARD
    const topErc20PerksBySub = await runLeaderBoardQuery({
        joinTable: 'erc20perkpayments',
        model: ERC20Perk,
        key: 'perkId',
        poolId: String(pool._id),
        amountField: 'pointPrice',
    });
    const topErc721PerksBySub = await runLeaderBoardQuery({
        joinTable: 'erc721perkpayments',
        model: ERC721Perk,
        key: 'perkId',
        poolId: String(pool._id),
        amountField: 'pointPrice',
    });
    const topReferralClaimsBySub = await runLeaderBoardQuery({
        joinTable: 'referralrewardclaims',
        key: 'referralRewardId',
        model: ReferralReward,
        poolId: String(pool._id),
        amountField: 'amount',
        extraFilter: { isApproved: true },
    });
    const topPointClaimsBySub = await runLeaderBoardQuery({
        joinTable: 'pointrewardclaims',
        model: PointReward,
        key: 'pointRewardId',
        poolId: String(pool._id),
        amountField: 'amount',
    });
    const topMilestonesClaimsBySub = await runLeaderBoardQuery({
        joinTable: 'milestonerewardclaims',
        model: MilestoneReward,
        key: 'milestoneRewardId',
        poolId: String(pool._id),
        amountField: 'amount',
        extraFilter: { isClaimed: true },
    });
    type leaderBoardQueryResult = { _id: string; total_amount: number };

    const leaderBoardQueryResultMerged: leaderBoardQueryResult[] = [
        ...topErc20PerksBySub,
        ...topErc721PerksBySub,
        ...topReferralClaimsBySub,
        ...topPointClaimsBySub,
        ...topMilestonesClaimsBySub,
    ];

    const leaderBoard: { sub: string; score: number; name: string; email: string }[] = [];
    // Group by sub and sort by highest score
    for (let i = 0; i < leaderBoardQueryResultMerged.length; i++) {
        const data = leaderBoardQueryResultMerged[i];
        const sub = data._id;
        if (i === 0) {
            const account = await AccountProxy.getById(sub);
            leaderBoard.push({ sub, score: data.total_amount, name: account.firstName, email: account.email });
        } else {
            const index = leaderBoard.map((x) => x.sub).indexOf(data._id);
            if (index >= 0) {
                leaderBoard[index].score += data.total_amount;
            } else {
                const account = await AccountProxy.getById(sub);
                leaderBoard.push({ sub, score: data.total_amount, name: account.firstName, email: account.email });
            }
        }
    }
    leaderBoard.sort((a, b) => b.score - a.score);

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
        leaderBoard,
    };
    res.json(result);
};

/**
 *
 * @returns the rewards per poolId, with the claims for each reward,
 * filtered by a time range,
 * grouped by day of claim creation
 * with the total claims per reward
 * and the sum of the reward amount * total claims per reward per day
 */
async function runAggregateQuery<T>(args: {
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

export default { controller, validation };
