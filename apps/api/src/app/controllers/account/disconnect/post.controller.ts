import { Response, Request } from 'express';
import { body } from 'express-validator';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const validation = [body('kind').isString()];

const controller = async (req: Request, res: Response) => {
    const account = await AccountProxy.findById(req.auth.sub);
    await AccountProxy.disconnect(account, req.body.kind);

    res.end();
};
export default { controller, validation };
