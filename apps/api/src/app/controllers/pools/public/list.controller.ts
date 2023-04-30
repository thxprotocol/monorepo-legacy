import { Request, Response } from 'express';
import { AssetPool, AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import BrandService from '@thxnetwork/api/services/BrandService';
import { Widget } from '@thxnetwork/api/models/Widget';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pools = await AssetPool.find({});

    res.json(
        await Promise.all(
            pools.map(async (p: AssetPoolDocument) => {
                const poolId = String(p._id);
                const { logoImgUrl, backgroundImgUrl } = await BrandService.get(poolId);
                const { domain } = await Widget.findOne({ poolId });
                return {
                    title: p.settings.title,
                    expiryDate: p.settings.endDate,
                    address: p.address,
                    chainId: p.chainId,
                    domain,
                    logoImgUrl,
                    backgroundImgUrl,
                    tags: ['Gaming', 'Web3'],
                    participants: 23,
                };
            }),
        ),
    );
};

export default { controller };
