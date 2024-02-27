import { assertRequestInput } from '@thxnetwork/api/middlewares';
import express, { Request, Response, NextFunction } from 'express';
import ReadWidget from './get.controller';
import ReadWidgetScript from './js/get.controller';
import { Pool } from '@thxnetwork/api/models';

const router = express.Router();
const isMongoId = (str: string) => {
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    return objectIdPattern.test(str);
};
router.get('/:id.:ext', assertRequestInput(ReadWidgetScript.validation), ReadWidgetScript.controller);
router.get(
    '/:id',
    async (req: Request, res: Response, next: NextFunction) => {
        if (!isMongoId(req.params.id)) {
            const pool = await Pool.findOne({ 'settings.slug': req.params.id });
            req.params.id = String(pool._id);
        }
        next();
    },
    assertRequestInput(ReadWidget.validation),
    ReadWidget.controller,
);

export default router;
