import { NextFunction, Request, Response } from 'express';
import { THXHttpError } from '../util/errors';
import { NODE_ENV } from '../util/secrets';

interface ErrorResponse {
    error: {
        message: string;
        error?: Error;
        rootMessage?: string;
        stack?: string;
    };
}

const isJsonPath = (path: string): boolean => {
    // This determines for which prefixes a json error is presented.
    for (const prefix of ['/account', '/health']) {
        if (path.startsWith(prefix)) return true;
    }
    return false;
};

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
    if (isJsonPath(req.path)) {
        res.json(response);
    } else {
        res.render('error', { rewardUrl: '', alert: { variant: 'danger', message: response.error.message } });
    }
};
