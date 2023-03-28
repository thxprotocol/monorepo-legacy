import { Request, Response } from 'express';
import { param, query } from 'express-validator';
import { PoolSubscription } from '@thxnetwork/api/models/PoolSubscription';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { BadRequestError } from '@thxnetwork/api/util/errors';

const validation = [param('id').isMongoId(), query('email').optional().isEmail()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    if (req.query.email) {
        const account = await AccountProxy.getById(req.auth.sub);
        if (account.email) {
            throw new BadRequestError('The email is already present for this account');
        }
        account.email = String(req.query.email);
        await AccountProxy.update(req.auth.sub, account);
    }
    const subscription = await PoolSubscription.create({ poolId: req.params.id, sub: req.auth.sub });

    res.status(201).json(subscription);
};

export default { controller, validation };
