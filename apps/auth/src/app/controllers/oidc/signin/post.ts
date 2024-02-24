import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { UnauthorizedError } from '@thxnetwork/auth/util/errors';
import AuthService from '../../../services/AuthService';

const validation = [body('email').optional().isEmail(), param('uid').isMongoId()];

async function controller(req: Request, res: Response) {
    const { email } = req.body;
    if (!email) throw new UnauthorizedError('Email is required');

    return await AuthService.redirectOTP(req, res, { email });
}

export default { controller, validation };
