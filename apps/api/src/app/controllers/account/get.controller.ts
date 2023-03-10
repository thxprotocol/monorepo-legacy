import { Request, Response } from 'express';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { Merchant } from '@thxnetwork/api/models/Merchant';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Account']
    const account = await AccountProxy.getById(req.auth.sub);
    const merchant = await Merchant.findOne({ sub: account.sub });

    res.json({ ...account, merchant });
};
export default { controller };
