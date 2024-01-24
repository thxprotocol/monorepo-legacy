import { Request, Response } from 'express';
import { AssetPool, AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { Widget } from '@thxnetwork/api/models/Widget';
import { query } from 'express-validator';
import Brand from '@thxnetwork/api/models/Brand';
import { Participant } from '@thxnetwork/api/models/Participant';

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
    const results = await AssetPool.find($match).sort({ rank: 1 }).skip(startIndex).limit(limit);

    return { limit, results };
};

const validation = [query('page').isInt(), query('limit').isInt(), query('search').optional().isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const { page, limit, search } = req.query;
    const result = await paginatedResults(Number(page), Number(limit), search ? String(search) : '');
    const widgets = await Widget.find({ poolId: result.results.map((p: AssetPoolDocument) => p._id) });
    const brands = await Brand.find({ poolId: result.results.map((p: AssetPoolDocument) => p._id) });

    result.results = (await Promise.all(
        result.results.map(async (pool) => {
            const widget = widgets.find((w) => w.poolId === String(pool._id));
            const brand = brands.find((b) => b.poolId === String(pool._id));
            const participantCount = await Participant.countDocuments({ poolId: pool._id });
            return {
                _id: pool._id,
                rank: pool.rank,
                slug: pool.settings.slug || pool._id,
                title: pool.settings.title,
                expiryDate: pool.settings.endDate,
                address: pool.safeAddress,
                chainId: pool.chainId,
                domain: widget ? widget.domain : 'https://www.thx.network',
                logoImgUrl: brand && brand.logoImgUrl,
                backgroundImgUrl: brand && brand.backgroundImgUrl,
                // tags: ['Gaming', 'Web3'],
                participants: participantCount,
                active: widget && widget.active,
            };
        }),
    )) as any;

    res.json(result);
};

export default { controller, validation };
