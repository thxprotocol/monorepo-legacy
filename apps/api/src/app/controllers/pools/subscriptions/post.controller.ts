import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { PoolSubscription } from '@thxnetwork/api/models/PoolSubscription';
import { TAccount } from '@thxnetwork/types/interfaces';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const validation = [param('id').isMongoId(), body('email').optional().isEmail()];

const controller = async (req: Request, res: Response) => {
    if (req.body.email) {
        await AccountProxy.update(req.auth.sub, { email: String(req.body.email) } as TAccount);
    }
    const subscription = await PoolSubscription.create({ poolId: req.params.id, sub: req.auth.sub });

    res.status(201).json(subscription);
};

export default { controller, validation };
