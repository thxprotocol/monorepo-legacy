import { Response, Request } from 'express';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const controller = async (req: Request, res: Response) => {
    await AccountProxy.remove(req.auth.sub);

    res.status(204).end();
};
export default { controller };
