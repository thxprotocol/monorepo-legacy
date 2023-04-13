import { Request, Response } from 'express';
import { query } from 'express-validator';
import { Wallet } from '@thxnetwork/api/services/WalletService';
import { currentVersion } from '@thxnetwork/contracts/exports';
import { WalletDocument } from '@thxnetwork/api/models/Wallet';

const validation = [
    query('chainId').optional().isNumeric(),
    query('sub').optional().isString(),
    query('chainId').optional().isString(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const query = {};
    if (req.query.sub) query['sub'] = req.query.sub;
    if (req.query.address) query['address'] = req.query.address;
    if (req.query.chainId) query['chainId'] = Number(req.query.chainId);

    const wallets = await Wallet.find(query);

    res.json(
        wallets.map((wallet: WalletDocument) => {
            return { ...wallet.toJSON(), latestVersion: currentVersion };
        }),
    );
};

export default { controller, validation };
