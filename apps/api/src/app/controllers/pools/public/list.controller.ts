import { Request, Response } from 'express';
import { AssetPool, AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import BrandService from '@thxnetwork/api/services/BrandService';
import { Widget } from '@thxnetwork/api/models/Widget';
import PoolService from '@thxnetwork/api/services/PoolService';
import { logger } from '@thxnetwork/api/util/logger';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pools = await AssetPool.find({});

    res.json(
        await Promise.all(
            pools.map(async (pool: AssetPoolDocument) => {
                try {
                    const poolId = String(pool._id);
                    const brand = await BrandService.get(poolId);
                    const { active, domain } = await Widget.findOne({ poolId });
                    const participants = await PoolService.getParticipantCount(pool);
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
                        title: pool.settings.title,
                        expiryDate: pool.settings.endDate,
                        address: pool.address,
                        chainId: pool.chainId,
                        domain,
                        logoImgUrl: brand && brand.logoImgUrl,
                        backgroundImgUrl: brand && brand.backgroundImgUrl,
                        tags: ['Gaming', 'Web3'],
                        participants,
                        active,
                        progress,
                    };
                } catch (error) {
                    logger.error(error);
                }
            }),
        ),
    );
};

export default { controller };
