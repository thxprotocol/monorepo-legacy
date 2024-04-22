import { Request, Response } from 'express';
import { Pool, PoolDocument, Brand } from '@thxnetwork/api/models';
import { Widget } from '@thxnetwork/api/models/Widget';
import { query } from 'express-validator';
import { Participant } from '@thxnetwork/api/models/Participant';
import RewardService from '@thxnetwork/api/services/RewardService';
import QuestService from '@thxnetwork/api/services/QuestService';

const matchTitle = (search) => {
    if (!search || !search.length) return;
    return new RegExp(
        search
            .split(/\s+/)
            .map((word) => `(?=.*${word})`)
            .join(''),
        'i',
    );
};

export const paginatedResults = async (page: number, limit: number, search: string) => {
    const startIndex = (page - 1) * limit;
    const $match = {
        'rank': { $exists: true },
        'settings.isPublished': true,
        ...(search && { 'settings.title': matchTitle(search) }),
    };
    const total = await Pool.countDocuments($match);
    const results = await Pool.find($match).sort({ rank: 1 }).skip(startIndex).limit(limit);

    return { page, total, limit, results };
};

const validation = [query('page').isInt(), query('limit').isInt(), query('search').optional().isString()];

const controller = async (req: Request, res: Response) => {
    const { page, limit, search } = req.query;
    const result = await paginatedResults(Number(page), Number(limit), search ? String(search) : '');
    const widgets = await Widget.find({ poolId: result.results.map((p: PoolDocument) => p._id) });
    const brands = await Brand.find({ poolId: result.results.map((p: PoolDocument) => p._id) });

    result.results = (await Promise.all(
        result.results.map(async (pool) => {
            const widget = widgets.find((w) => w.poolId === String(pool._id));
            const brand = brands.find((b) => b.poolId === String(pool._id));
            const participantCount = await Participant.countDocuments({ poolId: pool._id });
            const questCount = await QuestService.count({ poolId: pool._id });
            const rewardCount = await RewardService.count({ poolId: pool._id });
            return {
                _id: pool._id,
                rank: pool.rank,
                slug: pool.settings.slug || pool._id,
                title: pool.settings.title,
                domain: widget ? widget.domain : 'https://app.thx.network',
                logoImgUrl: brand && brand.logoImgUrl,
                backgroundImgUrl: brand && brand.backgroundImgUrl,
                participantCount,
                questCount,
                rewardCount,
                createdAt: pool.createdAt,
            };
        }),
    )) as any;

    res.json(result);
};

export default { controller, validation };
