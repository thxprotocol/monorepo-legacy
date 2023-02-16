import { Request, Response } from 'express';
import { param } from 'express-validator';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import PoolService from '@thxnetwork/api/services/PoolService';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import { ERC20Perk } from '@thxnetwork/api/models/ERC20Perk';
import { ERC721Perk } from '@thxnetwork/api/models/ERC721Perk';
import mongoose from 'mongoose';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import { IAccount } from '@thxnetwork/api/models/Account';

export const validation = [param('id').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);

    if (pool.sub !== req.auth.sub) throw new ForbiddenError('Only the pool owner can access this pool info');
    if (!pool.address) return res.json(pool.toJSON());

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
    leaderBoard.sort((a, b) => b.score - a.score);
    res.json(leaderBoard);
};

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
