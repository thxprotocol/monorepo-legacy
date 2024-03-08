import { Request, Response } from 'express';
import { query } from 'express-validator';
import { Wallet } from '@thxnetwork/api/models';
import { ChainId } from '@thxnetwork/common/enums';
import { NODE_ENV } from '@thxnetwork/api/config/secrets';

const validation = [query('chainId').optional().isNumeric(), query('poolId').optional().isString()];

const controller = async (req: Request, res: Response) => {
    const chainId = NODE_ENV === 'production' ? ChainId.Polygon : ChainId.Hardhat;
    const wallets = await Wallet.find({
        sub: req.auth.sub,
        chainId,
        safeVersion: { $exists: true },
        poolId: req.query.poolId,
    });

    res.json(wallets);
};

export default { controller, validation };
