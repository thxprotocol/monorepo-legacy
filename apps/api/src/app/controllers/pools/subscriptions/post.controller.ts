import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { PoolSubscription } from '@thxnetwork/api/models/PoolSubscription';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { BadRequestError } from '@thxnetwork/api/util/errors';

const validation = [param('id').isMongoId(), body('email').optional().isEmail()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    if (req.body.email) {
        const account = await AccountProxy.getById(req.auth.sub);
        if (account.email) {
            throw new BadRequestError('The email is already present for this account');
        }

        await AccountProxy.update(req.auth.sub, { email: String(req.body.email) });
    }
    const subscription = await PoolSubscription.create({ poolId: req.params.id, sub: req.auth.sub });

    res.status(201).json(subscription);
};

export default { controller, validation };
