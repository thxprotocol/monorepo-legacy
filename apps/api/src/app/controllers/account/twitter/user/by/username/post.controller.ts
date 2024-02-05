import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import TwitterDataProxy from '@thxnetwork/api/proxies/TwitterDataProxy';
import { Request, Response } from 'express';
import { body } from 'express-validator';

const validation = [body('username').isString()];

const controller = async (req: Request, res: Response) => {
    const account = await AccountProxy.findById(req.auth.sub);
    const user = await TwitterDataProxy.getUserByUsername(account, req.body.username);

    res.json(user);
};

export default { controller, validation };
