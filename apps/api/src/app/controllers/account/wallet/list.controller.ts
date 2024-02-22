import { Request, Response } from 'express';
import { query } from 'express-validator';
import WalletService from '@thxnetwork/api/services/WalletService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const validation = [query('chainId').optional().isNumeric()];

const controller = async (req: Request, res: Response) => {
    const account = await AccountProxy.findById(req.auth.sub);
    const wallets = await WalletService.list(account);

    res.json(wallets);
};

export default { controller, validation };
