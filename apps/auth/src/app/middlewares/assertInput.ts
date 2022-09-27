import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export function assertInput(validations: any) {
    return async function (req: Request, res: Response, next: NextFunction) {
        await Promise.all(validations.map((validation: any) => validation.run(req)));

        const errors = validationResult(req);

        if (errors.isEmpty()) return next();
        if (!req.interaction) throw new Error('no interaction');

        req.interaction.alert = { variant: 'danger', message: errors };
        await req.interaction.save();

        next();
    };
}
