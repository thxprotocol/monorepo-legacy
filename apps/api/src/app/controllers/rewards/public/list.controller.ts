import { Request, Response } from 'express';
import { query } from 'express-validator';
import { DailyReward } from '@thxnetwork/api/models/DailyReward';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import { Web3Quest } from '@thxnetwork/api/models/Web3Quest';

export const paginatedResults = async (model: any, limit: number) => {
    return await model
        .aggregate([
            {
                $lookup: {
                    from: 'widgets',
                    localField: 'poolId',
                    foreignField: 'poolId',
                    as: 'widgets',
                },
            },
            {
                $lookup: {
                    from: 'brands',
                    localField: 'poolId',
                    foreignField: 'poolId',
                    as: 'brands',
                },
            },
            {
                $lookup: {
                    from: 'erc20perks',
                    localField: 'poolId',
                    foreignField: 'poolId',
                    as: 'erc20Perks',
                },
            },
            {
                $lookup: {
                    from: 'erc721perks',
                    localField: 'poolId',
                    foreignField: 'poolId',
                    as: 'erc721Perks',
                },
            },
            {
                $lookup: {
                    from: 'customrewards',
                    localField: 'poolId',
                    foreignField: 'poolId',
                    as: 'customRewards',
                },
            },
            {
                $addFields: {
                    totalRewardsCount: {
                        $size: {
                            $concatArrays: ['$erc20Perks', '$erc721Perks', '$customRewards'],
                        },
                    },
                },
            },
            {
                $match: {
                    'totalRewardsCount': { $gt: 0 },
                    'widgets.0.active': true,
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $limit: limit,
            },
        ])
        .exec();
};

const validation = [query('page').isInt(), query('limit').isInt(), query('search').optional().isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const results = [];
    for (const model of [DailyReward, ReferralReward, PointReward, MilestoneReward, Web3Quest]) {
        const result = await paginatedResults(model, 4);
        const quests = result.map((q) => ({
            title: q.title,
            description: q.description,
            widget: q.widget,
            amount: q.amounts ? q.amounts[q.amounts.length - 1] : q.amount,
            domain: q.widgets[0].domain,
            brand: q.brands[0],
        }));
        results.push(quests);
    }
    const [daily, invite, social, custom, web3] = results;
    const response = { daily, invite, social, custom, web3 };
    res.json(response);
};

export default { controller, validation };
