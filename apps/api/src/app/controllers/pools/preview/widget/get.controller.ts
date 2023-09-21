import { Request, Response } from 'express';
import { param } from 'express-validator';
import BrandService from '@thxnetwork/api/services/BrandService';
import CanvasService from '@thxnetwork/api/services/CanvasService';

export const validation = [param('id').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    // Get brand background
    const brand = await BrandService.get(req.params.id);
    if (!brand) return res.status(404).end();

    // Create campaign widget preview
    const buffer = await CanvasService.createCampaignWidgetPreviewImage(brand);
    res.header({ 'Content-Type': 'image/png' }).send(buffer);
};

export default { controller, validation };
