import { NextFunction, Request, Response } from 'express';
import { THXHttpError } from '@thxnetwork/api/util/errors';
import { NODE_ENV } from '@thxnetwork/api/config/secrets';

interface ErrorResponse {
    error: {
        message: string;
        error?: Error;
        rootMessage?: string;
        stack?: string;
    };
}

// Error handler needs to have 4 arguments.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorOutput = (error: any, req: Request, res: Response, next: NextFunction) => {
    let status = 500;
    const response: ErrorResponse = { error: { message: 'Unable to fulfill request' } };
    if (error instanceof THXHttpError || error.status) {
        status = error.status;
        response.error.message = error.message;
    } else if (NODE_ENV !== 'production') {
        response.error.error = error;
        response.error.stack = error.stack;
    }

    res.status(status);
    res.json(response);
};
