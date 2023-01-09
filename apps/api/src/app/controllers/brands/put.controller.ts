import { isValidUrl } from '@thxnetwork/api/util/url';
import { Request, Response } from 'express';
import { body } from 'express-validator';

import BrandService from '../../services/BrandService';

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
        const brand = await BrandService.update({ poolId: req.header('X-PoolId') }, req.body);
        res.json(brand);
    },
};
