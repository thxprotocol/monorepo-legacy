import { Request, Response } from 'express';
import { query } from 'express-validator';
import WalletService from '@thxnetwork/api/services/WalletService';
import { currentVersion } from '@thxnetwork/contracts/exports';
import { WalletDocument } from '@thxnetwork/api/models/Wallet';

const validation = [query('chainId').optional().isNumeric(), query('sub').exists().isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const wallets = await WalletService.findByQuery(req.query);

    res.json(
        wallets.map((wallet: WalletDocument) => {
            return { ...wallet.toJSON(), isUpgradeAvailable: currentVersion !== wallet.version };
        }),
    );
};

export default { controller, validation };
