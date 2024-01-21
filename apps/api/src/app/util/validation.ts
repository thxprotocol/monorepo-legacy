import { body, check, validationResult } from 'express-validator';
import { Response, Request, NextFunction } from 'express';
import { BadRequestError } from './errors';
import { TInfoLink } from '@thxnetwork/common/lib/types';
import { isValidUrl } from './url';
import ImageService from '../services/ImageService';

export const validate = (validations: any) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        await Promise.all(validations.map((validation: any) => validation.run(req)));

        const errors = validationResult(req);

        if (errors.isEmpty()) {
            return next();
        }

        res.status(400).json({ errors: errors.array() });
    };
};

export const confirmPassword = body('confirmPassword')
    .exists()
    .custom((confirmPassword, { req }) => {
        if (confirmPassword !== req.body.password) {
            throw new BadRequestError('Passwords are not identical');
        }
        return true;
    });

export const defaults = {
    quest: [
        body('index').optional().isInt(),
        body('title').optional().isString(),
        body('description').optional().isString(),
        body('expiryDate').optional().isISO8601(),
        body('isPublished')
            .optional()
            .isBoolean()
            .customSanitizer((value) => JSON.parse(value)),
        check('file')
            .optional()
            .custom((value, { req }) => {
                return ['jpg', 'jpeg', 'gif', 'png'].includes(req.file.mimetype);
            }),
        body('infoLinks')
            .optional()
            .customSanitizer((infoLinks) => {
                return JSON.parse(infoLinks).filter((link: TInfoLink) => link.label.length && isValidUrl(link.url));
            }),
        body('locks')
            .optional()
            .custom((value) => {
                const locks = JSON.parse(value);
                return Array.isArray(locks);
            })
            .customSanitizer((locks) => locks && JSON.parse(locks)),
    ],
    reward: [
        body('title').optional().isString(),
        body('description').optional().isString(),
        body('expiryDate').optional().isISO8601(),
        body('limit').optional().isNumeric(),
        body('pointPrice').optional().isNumeric(),
        body('isPublished')
            .optional()
            .isBoolean()
            .customSanitizer((value) => JSON.parse(value)),
        check('file')
            .optional()
            .custom((value) => {
                return ['jpg', 'jpeg', 'gif', 'png'].includes(value.mimetype);
            }),
        body('locks')
            .optional()
            .custom((value) => {
                const locks = JSON.parse(value);
                return Array.isArray(locks);
            })
            .customSanitizer((locks) => locks && JSON.parse(locks)),
    ],
};
