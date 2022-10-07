import { body, validationResult } from 'express-validator';
import { Response, Request, NextFunction } from 'express';
import { BadRequestError } from './errors';

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
