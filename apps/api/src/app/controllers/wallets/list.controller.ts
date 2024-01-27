import { Request, Response } from 'express';
import { query } from 'express-validator';
import { Wallet } from '@thxnetwork/api/services/SafeService';
import { getChainId } from '@thxnetwork/api/services/ContractService';

const validation = [query('chainId').optional().isInt()];

const controller = async (req: Request, res: Response) => {
    const chainId = req.query.chainId || getChainId();
    const wallets = await Wallet.find({ sub: req.auth.sub, chainId });

    res.json(wallets);
};

export default { controller, validation };
