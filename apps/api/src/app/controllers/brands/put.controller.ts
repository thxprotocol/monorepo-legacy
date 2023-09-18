import { isValidUrl } from '@thxnetwork/api/util/url';
import { Request, Response } from 'express';
import { body } from 'express-validator';
import BrandService from '../../services/BrandService';
import PoolService from '@thxnetwork/api/services/PoolService';
import { ForbiddenError } from '@thxnetwork/api/util/errors';

export default {
    validation: [
        body('logoImgUrl').custom((logoImgUrl?: string) => {
            return logoImgUrl && logoImgUrl.length ? isValidUrl(logoImgUrl) : true;
        }),
        body('backgroundImgUrl').custom((backgroundImgUrl?: string) => {
            return backgroundImgUrl && backgroundImgUrl.length ? isValidUrl(backgroundImgUrl) : true;
        }),
    ],
    controller: async (req: Request, res: Response) => {
        const poolId = req.header('X-PoolId');
        const hasAccess = await PoolService.hasAccess(req.auth.sub, poolId);
        if (!hasAccess) throw new ForbiddenError('Not your pool');

        const brand = await BrandService.update({ poolId }, req.body);
        res.json(brand);
    },
};
