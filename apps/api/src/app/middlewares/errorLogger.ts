import { THXHttpError } from '@thxnetwork/api/util/errors';
import { logger } from '@thxnetwork/api/util/logger';
import { NextFunction, Request, Response } from 'express';

export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction) => {
    if (!(error instanceof THXHttpError)) {
        logger.error('Error caught:', error);
    }

    next(error);
};
