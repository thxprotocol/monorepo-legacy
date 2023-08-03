import { Request, Response } from 'express';
import { query } from 'express-validator';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [query('chainId').optional().isNumeric()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Account']
    const account = await AccountProxy.getById(req.auth.sub);

    // Upon signin this creates the wallet of a metamask user
    if (req.query.chainId && account.variant === AccountVariant.Metamask) {
        const chainId = Number(req.query.chainId);
        const wallet = await SafeService.findPrimary(account.sub, chainId);
        if (!wallet) {
            await SafeService.create({
                chainId,
                sub: account.sub,
                address: account.address,
            });
        }
    }

    res.json(account);
};

export default { controller, validation };
