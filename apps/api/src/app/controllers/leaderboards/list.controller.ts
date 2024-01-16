import { Request, Response } from 'express';
import { NODE_ENV } from '@thxnetwork/api/config/secrets';
import { AssetPool, AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { Widget } from '@thxnetwork/api/models/Widget';
import { logger } from '@thxnetwork/api/util/logger';
import { ChainId } from '@thxnetwork/types/enums';
import { query } from 'express-validator';
import Brand from '@thxnetwork/api/models/Brand';

export const paginatedResults = async (page: number, limit: number, search: string) => {
    const startIndex = (page - 1) * limit;
    const $match = {
        'settings.isPublished': true,
        'chainId': NODE_ENV === 'production' ? ChainId.Polygon : ChainId.Hardhat,
        'totalQuestCount': { $gt: 0 },
        'totalRewardsCount': { $gt: 0 },
    };

    if (search) {
        const $regex = new RegExp(
            search
                .split(/\s+/)
                .map((word) => `(?=.*${word})`)
                .join(''),
            'i',
        );
        $match['settings.title'] = { $regex };
    }
    const results = await AssetPool.aggregate([
        {
            $addFields: {
                id: { $toString: '$_id' },
            },
        },
        {
            $lookup: {
                from: 'participants',
                localField: 'id',
                foreignField: 'poolId',
                as: 'participants',
            },
        },
        {
            $lookup: {
                from: 'erc20perks',
                localField: 'id',
                foreignField: 'poolId',
                as: 'erc20Perks',
            },
        },
        {
            $lookup: {
                from: 'erc721perks',
                localField: 'id',
                foreignField: 'poolId',
                as: 'erc721Perks',
            },
        },
        {
            $lookup: {
                from: 'customrewards',
                localField: 'id',
                foreignField: 'poolId',
                as: 'customRewards',
            },
        },
        {
            $lookup: {
                from: 'couponrewards',
                localField: 'id',
                foreignField: 'poolId',
                as: 'couponRewards',
            },
        },
        {
            $lookup: {
                from: 'discordrolerewards',
                localField: 'id',
                foreignField: 'poolId',
                as: 'discordRoleRewards',
            },
        },
        {
            $lookup: {
                from: 'dailyrewards',
                localField: 'id',
                foreignField: 'poolId',
                as: 'dailyquests',
            },
        },
        {
            $lookup: {
                from: 'referralrewards',
                localField: 'id',
                foreignField: 'poolId',
                as: 'invitequests',
            },
        },
        {
            $lookup: {
                from: 'pointrewards',
                localField: 'id',
                foreignField: 'poolId',
                as: 'socialquests',
            },
        },
        {
            $lookup: {
                from: 'milestonerewards',
                localField: 'id',
                foreignField: 'poolId',
                as: 'customquests',
            },
        },
        {
            $lookup: {
                from: 'web3quests',
                localField: 'id',
                foreignField: 'poolId',
                as: 'web3quests',
            },
        },
        {
            $lookup: {
                from: 'gitcoinquests',
                localField: 'id',
                foreignField: 'poolId',
                as: 'gitcoinquests',
            },
        },
        {
            $addFields: {
                totalQuestCount: {
                    $size: {
                        $concatArrays: [
                            '$dailyquests',
                            '$invitequests',
                            '$socialquests',
                            '$customquests',
                            '$web3quests',
                            '$gitcoinquests',
                        ],
                    },
                },
                totalRewardsCount: {
                    $size: {
                        $concatArrays: [
                            '$erc20Perks',
                            '$erc721Perks',
                            '$customRewards',
                            '$couponRewards',
                            '$discordRoleRewards',
                        ],
                    },
                },
                participantCount: { $size: '$participants' },
            },
        },
        {
            $facet: {
                total: [{ $match }, { $count: 'count' }],
                results: [
                    { $match },
                    {
                        $sort: { rank: -1 },
                    },
                    {
                        $skip: startIndex,
                    },
                    {
                        $limit: limit,
                    },
                ],
            },
        },
        {
            $unwind: '$total',
        },
        {
            $project: {
                total: '$total.count',
                results: 1,
                participantCount: 1,
            },
        },
    ]).exec();

    if (!results[0]) return { limit, results: [] };
    return { limit, ...results[0] };
};

const validation = [query('page').isInt(), query('limit').isInt(), query('search').optional().isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const { page, limit, search } = req.query;
    const result = await paginatedResults(Number(page), Number(limit), search ? String(search) : '');
    const widgets = await Widget.find({ poolId: result.results.map((p: AssetPoolDocument) => p._id) });
    const brands = await Brand.find({ poolId: result.results.map((p: AssetPoolDocument) => p._id) });

    result.results = (
        await Promise.all(
            result.results.map(
                async (
                    pool: AssetPoolDocument & {
                        participantCount: number;
                        totalQuestCount: number;
                        totalRewardsCount: number;
                    },
                ) => {
                    try {
                        const poolId = String(pool._id);
                        const widget = widgets.find((w) => w.poolId === poolId);
                        const brand = brands.find((b) => b.poolId === poolId);

                        let progress = 0;
                        if (pool.settings.endDate) {
                            const start = new Date(pool.createdAt).getTime();
                            const now = Date.now();
                            const end = new Date(pool.settings.endDate).getTime();
                            const period = end - start;
                            progress = ((now - start) / period) * 100;
                        }

                        return {
                            _id: poolId,
                            rank: pool.rank,
                            slug: pool.settings.slug || poolId,
                            title: pool.settings.title,
                            expiryDate: pool.settings.endDate,
                            address: pool.address,
                            chainId: pool.chainId,
                            domain: widget && widget.domain,
                            logoImgUrl: brand && brand.logoImgUrl,
                            backgroundImgUrl: brand && brand.backgroundImgUrl,
                            // tags: ['Gaming', 'Web3'],
                            participants: pool.participantCount,
                            rewards: pool.totalRewardsCount,
                            quests: pool.totalQuestCount,
                            active: widget && widget.active,
                            progress,
                        };
                    } catch (error) {
                        logger.error(error);
                    }
                },
            ),
        )
    ).filter((pool) => !!pool);

    res.json(result);
};

export default { controller, validation };
