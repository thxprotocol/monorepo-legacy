import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { Request, Response } from 'express';
import { recoverSigner } from '@thxnetwork/api/util/network';

export default {
    controller: async (req: Request, res: Response) => {
        // #swagger.tags = ['Account']
        let account = await AccountProxy.getById(req.auth.sub);

        let address;
        if (req.body.authRequestMessage && req.body.authRequestSignature) {
            address = recoverSigner(req.body.authRequestMessage, req.body.authRequestSignature);

            // Deploy safe or add change owner for existing safe
        }

        account = await AccountProxy.update(req.auth.sub, { ...req.body, address });

        res.json(account);
    },
};
