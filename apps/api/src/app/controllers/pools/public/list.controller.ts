import { Request, Response } from 'express';
import { NODE_ENV } from '@thxnetwork/api/config/secrets';
import { AssetPool, AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { Widget } from '@thxnetwork/api/models/Widget';
import { logger } from '@thxnetwork/api/util/logger';
import { ChainId } from '@thxnetwork/types/enums';
import { cache } from '@thxnetwork/api/util/cache';
import BrandService from '@thxnetwork/api/services/BrandService';
import PoolService from '@thxnetwork/api/services/PoolService';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const cacheString = cache.get(req.originalUrl) as string;
    let response = cacheString && JSON.parse(cacheString);

    if (!response) {
        const pools = await AssetPool.find({ chainId: NODE_ENV === 'production' ? ChainId.Polygon : ChainId.Hardhat });
        response = await Promise.all(
            pools.map(async (pool: AssetPoolDocument) => {
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
        cache.set(req.originalUrl, JSON.stringify(response));
    }

    res.json(response);
};

export default { controller };
