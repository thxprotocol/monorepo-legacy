import { Request, Response } from 'express';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const controller = async (req: Request, res: Response) => {
    const account = await AccountProxy.update(req.auth.sub, req.body);
    res.json(account);
};

export default { controller };
