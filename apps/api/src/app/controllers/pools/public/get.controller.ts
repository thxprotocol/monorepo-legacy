import { Request, Response } from 'express';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';
import BrandService from '@thxnetwork/api/services/BrandService';
import { Widget } from '@thxnetwork/api/models/Widget';
import PoolService from '@thxnetwork/api/services/PoolService';
import { DailyReward } from '@thxnetwork/api/models/DailyReward';
import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import { ERC20Perk } from '@thxnetwork/api/models/ERC20Perk';
import { ERC721Perk } from '@thxnetwork/api/models/ERC721Perk';

const mapper = (list) => {
    return list.map((d) => {
        return { title: d.title, description: d.description, amount: d.amount };
    });
};

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await AssetPool.findById(req.params.id);
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

    res.json({
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
        active,
        progress,
        rewards: await (async () => {
            const dailyRewards = await DailyReward.find({ poolId });
            const referralRewards = await ReferralReward.find({ poolId });
            const pointRewards = await PointReward.find({ poolId });
            const milestoneRewards = await MilestoneReward.find({ poolId });

            return [
                ...mapper(dailyRewards),
                ...mapper(referralRewards),
                ...mapper(pointRewards),
                ...mapper(milestoneRewards),
            ];
        })(),
        perks: await (async () => {
            const erc20Perks = await ERC20Perk.find({ poolId });
            const erc721Perks = await ERC721Perk.find({ poolId });

            return [...mapper(erc20Perks), ...mapper(erc721Perks)];
        })(),
    });
};

export default { controller };
