import { Request, Response } from 'express';
import { param } from 'express-validator';
import PromotionService from '@thxnetwork/api/services/PromotionService';
import { PromoCodeNotFoundError } from '@thxnetwork/api/util/errors';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Promotions']
    const promotion = await PromotionService.findById(req.params.id);
    if (!promotion) throw new PromoCodeNotFoundError();

    const result = await PromotionService.formatResult(req.auth.sub, promotion);
    res.json(result);
};

export default { controller, validation };
