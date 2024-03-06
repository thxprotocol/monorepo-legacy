import { AUTH_URL } from '@thxnetwork/api/config/secrets';
import { Brand, Pool, Widget } from '@thxnetwork/api/models';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const widget = await Widget.findOne({ poolId: req.params.id });
    const pool = await Pool.findById(req.params.id);
    const brand = await Brand.findOne({ poolId: req.params.id });

    res.json({
        title: pool.settings.title,
        description: pool.settings.description,
        logoUrl: brand ? brand.logoImgUrl : AUTH_URL + '/img/logo-padding.png',
        backgroundUrl: brand ? brand.backgroundImgUrl : '',
        theme: widget.theme,
        domain: widget.domain,
        chainId: pool.chainId,
        poolId: pool._id,
        slug: pool.settings.slug || pool._id,
    });
};

export default { controller, validation };
