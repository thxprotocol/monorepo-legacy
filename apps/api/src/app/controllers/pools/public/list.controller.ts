import { Request, Response } from 'express';
import { NODE_ENV } from '@thxnetwork/api/config/secrets';
import { AssetPool, AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { Widget } from '@thxnetwork/api/models/Widget';
import { logger } from '@thxnetwork/api/util/logger';
import { ChainId } from '@thxnetwork/types/enums';
import BrandService from '@thxnetwork/api/services/BrandService';
import { query } from 'express-validator';

export const paginatedResults = async (model: any, page: number, limit: number, search: string) => {
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
    const [result] = await model
        .aggregate([
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
                $addFields: {
                    totalQuestCount: {
                        $size: {
                            $concatArrays: [
                                '$dailyquests',
                                '$invitequests',
                                '$socialquests',
                                '$customquests',
                                '$web3quests',
                            ],
                        },
                    },
                    totalRewardsCount: {
                        $size: {
                            $concatArrays: ['$erc20Perks', '$erc721Perks', '$customRewards', '$couponRewards'],
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
                            $sort: { participantCount: -1 },
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
        ])
        .exec();
    return {
        limit,
        ...result,
    };
};

const validation = [query('page').isInt(), query('limit').isInt(), query('search').optional().isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const { page, limit, search } = req.query;
    const result = await paginatedResults(AssetPool, Number(page), Number(limit), search ? String(search) : '');

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
                        const widget = await Widget.findOne({ poolId });
                        const brand = await BrandService.get(poolId);

                        let progress = 0;
                        if (pool.settings.endDate) {
                            const start = new Date(pool.createdAt).getTime();
                            const now = Date.now();
                            const end = new Date(pool.settings.endDate).getTime();
                            const period = end - start;
                            progress = ((now - start) / period) * 100;
                        }

                        return {
                            _id: pool._id,
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
