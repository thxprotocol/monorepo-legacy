import { Request, Response } from 'express';
import { AssetPool, AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import BrandService from '@thxnetwork/api/services/BrandService';
import { Widget } from '@thxnetwork/api/models/Widget';
import PoolService from '@thxnetwork/api/services/PoolService';
import { logger } from '@thxnetwork/api/util/logger';
import { ChainId } from '@thxnetwork/types/enums';
import { NODE_ENV } from '@thxnetwork/api/config/secrets';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pools = await AssetPool.find({ chainId: NODE_ENV === 'production' ? ChainId.Polygon : ChainId.Hardhat });
    const result = await Promise.all(
        pools.map(async (pool: AssetPoolDocument) => {
            try {
                const poolId = String(pool._id);
                const brand = await BrandService.get(poolId);
                const { active, domain } = await Widget.findOne({ poolId });
                const participants = await PoolService.getParticipantCount(pool);
                const quests = await PoolService.getQuestCount(pool);
                const rewards = await PoolService.getRewardCount(pool);

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
                    domain,
                    logoImgUrl: brand && brand.logoImgUrl,
                    backgroundImgUrl: brand && brand.backgroundImgUrl,
                    tags: ['Gaming', 'Web3'],
                    participants,
                    rewards,
                    quests,
                    active,
                    progress,
                };
            } catch (error) {
                logger.error(error);
            }
        }),
    );

    res.json(result.filter((p) => p));
};

export default { controller };
