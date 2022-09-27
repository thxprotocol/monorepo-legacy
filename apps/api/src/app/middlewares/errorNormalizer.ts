import { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '@thxnetwork/api/util/errors';
import { UnauthorizedError as JWTUnauthorizedError } from 'express-jwt';

export const errorNormalizer = (error: Error, _req: Request, _res: Response, next: NextFunction) => {
    if (error instanceof JWTUnauthorizedError) {
        return next(new UnauthorizedError(error.message));
    }

    next(error);
};
