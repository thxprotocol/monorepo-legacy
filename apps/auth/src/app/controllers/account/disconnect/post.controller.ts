import TokenService from '@thxnetwork/auth/services/TokenService';
import { Account } from '@thxnetwork/auth/models/Account';
import { Request, Response } from 'express';
import { body } from 'express-validator';

const validation = [body('kind').isString()];

export const controller = async (req: Request, res: Response) => {
    const account = await Account.findById(req.params.sub);
    await TokenService.unsetToken(account, req.body.kind);

    res.status(204).end();
};
export default { controller, validation };
