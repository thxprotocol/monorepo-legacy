import express, { Request, Response, NextFunction } from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import * as ReadWidget from './get.controller';
import * as ReadWidgetScript from './js/get.controller';
import { Pool } from '@thxnetwork/api/models';

const router: express.Router = express.Router();

router.get('/:id.:ext', assertRequestInput(ReadWidgetScript.validation), ReadWidgetScript.controller);
router.get(
    '/:id',
    async (req: Request, res: Response, next: NextFunction) => {
        const isMongoId = (str: string) => {
            const objectIdPattern = /^[0-9a-fA-F]{24}$/;
            return objectIdPattern.test(str);
        };

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
