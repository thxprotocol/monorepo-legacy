import { Request, Response } from 'express';
import { query } from 'express-validator';
import PromotionService from '@thxnetwork/api/services/PromotionService';

const validation = [query('limit').optional().isNumeric(), query('page').optional().isNumeric()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Promotions']
    const results = [];
    const page = await PromotionService.findByQuery(
        { poolId: String(req.assetPool._id) },
        req.query.page ? Number(req.query.page) : null, // Will default to 1 if undefined
        req.query.limit ? Number(req.query.limit) : null, // Will default to 10 if undefined
    );

    for (const promotion of page.results) {
        results.push(await PromotionService.formatResult(req.auth.sub, promotion));
    }

    page.results = results;

    res.json(page);
};

export default { controller, validation };
