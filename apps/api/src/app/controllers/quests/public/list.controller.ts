import { Request, Response } from 'express';
import { query } from 'express-validator';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';

export const paginatedResults = async (model: any, limit: number) => {
    const pipelines = [
        { collectionName: 'dailyrewards', target: 'dailyquests' },
        { collectionName: 'referralrewards', target: 'invitequests' },
        { collectionName: 'pointrewards', target: 'socialquests' },
        { collectionName: 'milestonerewards', target: 'customquests' },
        { collectionName: 'web3quests', target: 'web3quests' },
    ].map(({ collectionName, target }) => ({
        $lookup: {
            from: collectionName,
            localField: 'poolId',
            foreignField: 'poolId',
            as: target,
        },
    }));

    return await model
        .aggregate([
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
            ...pipelines,
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
                },
            },
        ])
        .exec();
};

const validation = [query('page').isInt(), query('limit').isInt(), query('search').optional().isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const decoratedPools = await paginatedResults(AssetPool, 4);
    const quests = decoratedPools
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
                ],
            };
        })
        .flatMap((r) => r.quests)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4);

    res.json(quests);
};

export default { controller, validation };
