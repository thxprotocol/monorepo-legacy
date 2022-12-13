import { Request, Response } from 'express';
import { param } from 'express-validator';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Account']
    const account = await AccountProxy.getById(req.auth.sub);
    res.json(account);
};
export default { controller, validation };
