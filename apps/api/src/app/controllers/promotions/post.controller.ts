import { Request, Response } from 'express';
import { body } from 'express-validator';
import PromotionService from '@thxnetwork/api/services/PromotionService';

export const validation = [
    body('title').isString().isLength({ min: 0, max: 50 }),
    body('description').optional().isString().isLength({ min: 0, max: 255 }),
    body('value').isString().isLength({ min: 0, max: 50 }),
    body('price').isInt({ min: 0 }),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Promotions']
    const promotion = await PromotionService.create({
        sub: req.auth.sub,
        title: req.body.title,
        description: req.body.description,
        value: req.body.value,
        price: req.body.price,
        poolId: String(req.assetPool._id),
    });

    res.status(201).json(promotion);
};

export default { controller, validation };
