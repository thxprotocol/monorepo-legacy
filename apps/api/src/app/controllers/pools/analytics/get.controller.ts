import { Request, Response } from 'express';
import { param, query } from 'express-validator';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import PoolService from '@thxnetwork/api/services/PoolService';
import { PointReward, PointRewardDocument } from '@thxnetwork/api/models/PointReward';
import { ERC20Perk, ERC20PerkDocument } from '@thxnetwork/api/models/ERC20Perk';
import { ERC721Perk, ERC721PerkDocument } from '@thxnetwork/api/models/ERC721Perk';
import mongoose from 'mongoose';
import { ReferralReward, ReferralRewardDocument } from '@thxnetwork/api/models/ReferralReward';

export const validation = [param('id').isMongoId(), query('startDate').exists(), query('endDate').exists()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);

    if (pool.sub !== req.auth.sub) throw new ForbiddenError('Only the pool owner can access this pool info');
    if (!pool.address) return res.json(pool.toJSON());

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
    const referralRewardsQueryResult = await runAggregateQuery<ReferralRewardDocument>({
        joinTable: 'referralrewardclaims',
        key: 'referralRewardId',
        model: ReferralReward,
        poolId: String(pool._id),
        amountField: 'amount',
        startDate,
        endDate,
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
}) {
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
                            ],
                        },
                    },
                ],
                as: 'children',
            },
        },
        {
            $unwind: '$children',
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: '%Y-%m-%d',
                        date: { $toDate: '$children.createdAt' },
                    },
                },
                children: {
                    $push: '$children',
                },
                childAmount: {
                    $first: `$${args.amountField}`,
                },
            },
        },
        {
            $project: {
                paymentsCount: {
                    $size: { $ifNull: ['$children', []] },
                },
                total_amount: {
                    $multiply: [
                        {
                            $size: { $ifNull: ['$children', []] },
                        },
                        {
                            $convert: {
                                input: '$childAmount',
                                to: 'int',
                            },
                        },
                    ],
                },
            },
        },
    ]);

    return queryResult;
}

export default { controller, validation };
