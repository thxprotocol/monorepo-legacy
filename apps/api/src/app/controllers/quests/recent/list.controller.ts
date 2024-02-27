import { Request, Response } from 'express';
import { query } from 'express-validator';
import { Pool } from '@thxnetwork/api/models';

const validation = [query('page').isInt(), query('limit').isInt(), query('search').optional().isString()];

const controller = async (req: Request, res: Response) => {
    const questLookupSteps = [
        { collectionName: 'dailyrewards', target: 'dailyquests' },
        { collectionName: 'referralrewards', target: 'invitequests' },
        { collectionName: 'pointrewards', target: 'socialquests' },
        { collectionName: 'milestonerewards', target: 'customquests' },
        { collectionName: 'web3quests', target: 'web3quests' },
        { collectionName: 'gitcoinquests', target: 'gitcoinquests' },
    ].map(({ collectionName, target }) => ({
        $lookup: {
            from: collectionName,
            localField: 'poolId',
            foreignField: 'poolId',
            as: target,
        },
    }));

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
        ...questLookupSteps,
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
                widget: result.widget,
                domain: result.widgets[0].domain,
                brand: result.brands[0],
            });
            return {
                quests: [
                    ...result.dailyquests.map(mapper).sort(sortByDate),
                    ...result.invitequests.map(mapper).sort(sortByDate),
                    ...result.socialquests.map(mapper).sort(sortByDate),
                    ...result.customquests.map(mapper).sort(sortByDate),
                    ...result.web3quests.map(mapper).sort(sortByDate),
                    ...result.gitcoinquests.map(mapper).sort(sortByDate),
                ],
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
