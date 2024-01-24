import { Request, Response } from 'express';
import { query } from 'express-validator';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';

const validation = [query('page').isInt(), query('limit').isInt(), query('search').optional().isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
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

    const decoratedPools = await AssetPool.aggregate([
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

    const result = decoratedPools
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
                    ...result.dailyquests.map(mapper),
                    ...result.invitequests.map(mapper),
                    ...result.socialquests.map(mapper),
                    ...result.customquests.map(mapper),
                    ...result.web3quests.map(mapper),
                    ...result.web3quests.map(mapper),
                ],
            };
        })
        .flatMap((r) => r.quests)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4);

    res.json(result);
};

export default { controller, validation };
