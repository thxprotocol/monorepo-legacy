import { isValidUrl } from '@thxnetwork/api/util/url';
import { Request, Response } from 'express';
import { body } from 'express-validator';
import BrandService from '../../services/BrandService';
import PoolService from '@thxnetwork/api/services/PoolService';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import CanvasService from '@thxnetwork/api/services/CanvasService';
import ImageService from '@thxnetwork/api/services/ImageService';

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

        const { logoImgUrl, backgroundImgUrl } = req.body;
        const brand = await BrandService.get(poolId);

        brand.logoImgUrl = logoImgUrl;
        brand.backgroundImgUrl = backgroundImgUrl;

        // Create campaign widget preview
        const widgetPreviewFile = await CanvasService.createCampaignWidgetPreviewImage(brand);
        brand.widgetPreviewImgUrl = await ImageService.uploadToS3(
            widgetPreviewFile,
            `${poolId}_widget_preview.png`,
            'image/*',
        );

        // Create campaign preview
        const previewFile = await CanvasService.createPreviewImage(brand);
        brand.previewImgUrl = await ImageService.uploadToS3(previewFile, `${poolId}_campaign_preview.png`, 'image/*');

        res.json(await brand.save());
    },
};
