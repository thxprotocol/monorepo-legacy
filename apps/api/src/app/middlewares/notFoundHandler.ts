import { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    next(new NotFoundError());
};
