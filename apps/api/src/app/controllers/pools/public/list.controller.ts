import { Request, Response } from 'express';
import { NODE_ENV } from '@thxnetwork/api/config/secrets';
import { AssetPool, AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { Widget } from '@thxnetwork/api/models/Widget';
import { logger } from '@thxnetwork/api/util/logger';
import { ChainId } from '@thxnetwork/types/enums';
import BrandService from '@thxnetwork/api/services/BrandService';
import PoolService from '@thxnetwork/api/services/PoolService';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { query } from 'express-validator';

const validation = [query('page').isInt(), query('search').optional().isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const { page, search } = req.query;

    const query = {
        chainId: NODE_ENV === 'production' ? ChainId.Polygon : ChainId.Hardhat,
    };
    if (search) query['settings.title'] = { $regex: search, $options: 'i' };

    const result = await paginatedResults(AssetPool, Number(page), 25, query);
    result.results = await Promise.all(
        result.results.map(async (pool: AssetPoolDocument) => {
            try {
                const poolId = String(pool._id);
                const widget = await Widget.findOne({ poolId });
                if (!widget) return;

                const [brand, participants, quests, rewards] = await Promise.all([
                    BrandService.get(poolId),
                    PoolService.getParticipantCount(pool),
                    PoolService.getQuestCount(pool),
                    PoolService.getRewardCount(pool),
                ]);

                const progress = (() => {
                    const data = {
                        start: new Date(pool.createdAt).getTime(),
                        now: Date.now(),
                        end: new Date(pool.settings.endDate).getTime(),
                    };
                    const period = data.end - data.start;
                    const progress = data.now - data.start;
                    return (progress / period) * 100;
                })();

                return {
                    _id: pool._id,
                    title: pool.settings.title,
                    expiryDate: pool.settings.endDate,
                    address: pool.address,
                    chainId: pool.chainId,
                    domain: widget.domain,
                    logoImgUrl: brand && brand.logoImgUrl,
                    backgroundImgUrl: brand && brand.backgroundImgUrl,
                    tags: ['Gaming', 'Web3'],
                    participants,
                    rewards,
                    quests,
                    active: widget.active,
                    progress,
                };
            } catch (error) {
                logger.error(error);
            }
        }),
    );

    res.json(result);
};

export default { controller, validation };
