import { Request, Response } from 'express';
import { param } from 'express-validator';
import Wallet from '@thxnetwork/api/models/Wallet';
import { NotFoundError } from '@thxnetwork/api/util/errors';

const validation = [param('id').exists().isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const wallet = await Wallet.findById(req.params.id);
    if (!wallet) throw new NotFoundError('Could not find the Wallet');
    res.status(200).json(wallet);
};

export default { controller, validation };
