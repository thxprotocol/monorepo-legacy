import { Request, Response } from 'express';
import { param } from 'express-validator';
import WalletManagerService from '@thxnetwork/api/services/WalletManagerService';

export const validation = [param('id').exists().isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const managers = await WalletManagerService.findByWalletId(req.params.id);
    res.json(managers);
};

export default { controller, validation };
