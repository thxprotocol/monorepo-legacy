import { Request, Response } from 'express';
import { AccountService } from '../../services/AccountService';
import { NotFoundError } from '../../util/errors';

export const patchAccount = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.params.id);
    if (!account) {
        throw new NotFoundError();
    }
    await AccountService.update(account, {
        address: req.body.address,
        googleAccess: req.body.googleAccess,
        twitterAccess: req.body.twitterAccess,
        authenticationToken: req.body.authenticationToken,
        authenticationTokenExpires: req.body.authenticationTokenExpires,
        plan: req.body.plan,
    });
    res.status(204).end();
};
