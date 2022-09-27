import { Response, Request } from 'express';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Account']
    await AccountProxy.remove(req.auth.sub);

    res.status(204).end();
};
export default { controller };
