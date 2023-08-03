import { Request, Response } from 'express';
import { query } from 'express-validator';
import { Wallet } from '@thxnetwork/api/services/WalletService';
import { currentVersion } from '@thxnetwork/contracts/exports';
import { WalletDocument } from '@thxnetwork/api/models/Wallet';

const validation = [query('chainId').optional().isNumeric(), query('chainId').optional().isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const query = { sub: req.auth.sub };
    if (req.query.chainId) query['chainId'] = Number(req.query.chainId);

    const wallets = await Wallet.find(query);

    res.json(
        await Promise.all(
            wallets.map(async (wallet: WalletDocument) => {
                return {
                    ...wallet.toJSON(),
                    latestVersion: currentVersion,
                };
            }),
        ),
    );
};

export default { controller, validation };
