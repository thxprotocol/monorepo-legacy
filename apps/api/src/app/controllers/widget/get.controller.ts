import { AUTH_URL } from '@thxnetwork/api/config/secrets';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';
import Brand from '@thxnetwork/api/models/Brand';
import { Widget } from '@thxnetwork/api/models/Widget';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Widget']
    const widget = await Widget.findOne({ poolId: req.params.id });
    const pool = await AssetPool.findById(req.params.id);
    const brand = await Brand.findOne({ poolId: req.params.id });
    const expired = pool.settings.endDate ? pool.settings.endDate.getTime() <= Date.now() : false;

    res.json({
        title: pool.settings.title,
        logoUrl: brand ? brand.logoImgUrl : AUTH_URL + '/img/logo-padding.png',
        backgroundUrl: brand ? brand.backgroundImgUrl : '',
        expired,
        theme: widget.theme,
        chainId: pool.chainId,
        poolId: pool._id,
        slug: pool.settings.slug || pool._id,
    });
};

export default { controller, validation };
