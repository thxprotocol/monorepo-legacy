import { Request, Response } from 'express';
import { query } from 'express-validator';
import {
    Pool,
    QuestDaily,
    QuestInvite,
    QuestSocial,
    QuestCustom,
    QuestWeb3,
    QuestGitcoin,
} from '@thxnetwork/api/models';
const validation = [query('page').isInt(), query('limit').isInt(), query('search').optional().isString()];

const controller = async (req: Request, res: Response) => {
    const questModels = [QuestDaily, QuestInvite, QuestSocial, QuestCustom, QuestWeb3, QuestGitcoin];
    const questLookupStages = questModels.map((model) => {
        return {
            $lookup: {
                from: model.collection.name,
                localField: 'poolId',
                foreignField: 'poolId',
                as: model.collection.name,
            },
        };
    });

    const decoratedPools = await Pool.aggregate([
        {
            $addFields: {
                poolId: {
                    $convert: {
                        input: '$_id',
                        to: 'string',
                    },
                },
            },
        },
        ...questLookupStages,
        {
            $lookup: {
                from: 'widget',
                localField: 'poolId',
                foreignField: 'poolId',
                as: 'widget',
            },
        },
        {
            $lookup: {
                from: 'brand',
                localField: 'poolId',
                foreignField: 'poolId',
                as: 'brand',
            },
        },
        {
            $match: {
                'settings.isPublished': true,
                'rank': { $exists: true },
            },
        },
    ]).exec();

    const sortByDate = (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

    const result = decoratedPools
        // Format and sort all quests per pool
        .map((result) => {
            const mapper = (q) => ({
                ...q,
                amount: q.amounts ? q.amounts[q.amounts.length - 1] : q.amount,
                widget: result.widget && result.widget[0],
                domain: result.widget && result.widget[0] && result.widget[0].domain,
                brand: result.brand && result.brand[0],
            });

            const quests = [
                ...result[QuestDaily.collection.name].map(mapper).sort(sortByDate),
                ...result[QuestInvite.collection.name].map(mapper).sort(sortByDate),
                ...result[QuestSocial.collection.name].map(mapper).sort(sortByDate),
                ...result[QuestCustom.collection.name].map(mapper).sort(sortByDate),
                ...result[QuestWeb3.collection.name].map(mapper).sort(sortByDate),
                ...result[QuestGitcoin.collection.name].map(mapper).sort(sortByDate),
            ];

            return {
                quests,
            };
        })
        // Last quest per pool
        .map((pool) => pool.quests[0])
        // Sort by createdAt
        .sort(sortByDate)
        // Cut of first 4 results
        .slice(0, 4);

    res.json(result);
};

export default { controller, validation };
