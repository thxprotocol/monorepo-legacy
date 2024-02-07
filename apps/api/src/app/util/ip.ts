import { Request } from 'express';

function getIP(req: Request) {
    return req.ip || req.header('x-forwarded-for');
}

export { getIP };
