import { Request, Response } from 'express';
import { param } from 'express-validator';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import { ReferralRewardClaim } from '@thxnetwork/api/models/ReferralRewardClaim';
import { Claim } from '@thxnetwork/api/models/Claim';
import PoolService from '@thxnetwork/api/services/PoolService';
import { PointReward, PointRewardDocument } from '@thxnetwork/api/models/PointReward';
import { ERC20Perk, ERC20PerkDocument } from '@thxnetwork/api/models/ERC20Perk';
import { ERC721Perk, ERC721PerkDocument } from '@thxnetwork/api/models/ERC721Perk';
import mongoose from 'mongoose';
import { ReferralReward, ReferralRewardDocument } from '@thxnetwork/api/models/ReferralReward';

export const validation = [param('id').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);

    if (pool.sub !== req.auth.sub) throw new ForbiddenError('Only the pool owner can access this pool info');
    if (!pool.address) return res.json(pool.toJSON());

    const erc20PerksQueryResult = await runAggregateQuery<ERC20PerkDocument>({
        joinTable: 'erc20perkpayments',
        key: 'perkId',
        model: ERC20Perk,
        poolId: String(pool._id),
        amountField: 'pointPrice',
    });
    const erc721PerksQueryResult = await runAggregateQuery<ERC721PerkDocument>({
        joinTable: 'erc721perkpayments',
        key: 'perkId',
        model: ERC721Perk,
        poolId: String(pool._id),
        amountField: 'pointPrice',
    });
    const referralRewardsQueryResult = await runAggregateQuery<ReferralRewardDocument>({
        joinTable: 'referralrewardclaims',
        key: 'referralRewardId',
        model: ReferralReward,
        poolId: String(pool._id),
        amountField: 'amount',
    });
    const pointRewardsQueryResult = await runAggregateQuery<PointRewardDocument>({
        joinTable: 'pointrewardclaims',
        key: 'pointRewardId',
        model: PointReward,
        poolId: String(pool._id),
        amountField: 'amount',
    });

    const result: any = {
        ...pool.toJSON(),
        metrics: {
            claims: await Claim.count({ poolId: pool._id }),
            erc20Perks: {
                total: erc20PerksQueryResult.recordsCount,
                payments: erc20PerksQueryResult.childrenCount,
                totalAmount: erc20PerksQueryResult.totalAmount,
            },
            erc721Perks: {
                total: erc721PerksQueryResult.recordsCount,
                payments: erc721PerksQueryResult.childrenCount,
                totalAmount: erc721PerksQueryResult.totalAmount,
            },
            referralRewards: {
                total: referralRewardsQueryResult.recordsCount,
                claims: referralRewardsQueryResult.childrenCount,
                totalClaimPoints: referralRewardsQueryResult.totalAmount,
            },
            pointRewards: {
                total: pointRewardsQueryResult.recordsCount,
                claims: pointRewardsQueryResult.childrenCount,
                totalClaimPoints: pointRewardsQueryResult.totalAmount,
            },
        },
    };

    res.json(result);
};

async function runAggregateQuery<T>(args: {
    model: mongoose.Model<T>;
    poolId: string;
    joinTable: string;
    key: string;
    amountField: string;
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
                let: { id: { $convert: { input: '$_id', to: 'string' } } },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ['$$id', `$${args.key}`],
                            },
                        },
                    },
                ],
                as: 'children',
            },
        },
        {
            $project: {
                children_count: { $size: '$children' },
                total_amount: {
                    $multiply: [
                        { $size: '$children' },
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
    const childrenCount = recordsCount
        ? queryResult
              .map((x) => x.children_count)
              .reduce((a, b) => {
                  return a + b;
              })
        : 0;
    const totalAmount = childrenCount
        ? queryResult
              .map((x) => x.total_amount)
              .reduce((a, b) => {
                  return a + b;
              })
        : 0;
    return { recordsCount, childrenCount, totalAmount };
}

export default { controller, validation };
