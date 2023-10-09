import { Request, Response } from 'express';
import { AccountService } from '../../services/AccountService';
import { ForbiddenError, NotFoundError } from '../../util/errors';
import { TAccount } from '@thxnetwork/types/interfaces';
import { hubspot } from '@thxnetwork/auth/util/hubspot';
import { Account } from '@thxnetwork/auth/models/Account';

export const patchAccount = async (req: Request, res: Response) => {
    let account = await AccountService.get(req.params.sub);
    if (!account) throw new NotFoundError();

    // Test username
    if (req.body.username) {
        const isInUse = await Account.exists({
            username: req.body.username,
            _id: { $ne: req.params.sub, $exists: true },
        });
        if (isInUse) throw new ForbiddenError('Username already in use.');
    }

    account = await AccountService.update(account, req.body as TAccount);

    hubspot.upsert({
        email: account.email,
        firstname: account.firstName,
        lastname: account.lastName,
        website: account.website,
        company: account.organisation,
        plan: account.plan,
        role: account.role,
        goals: account.goal,
    });

    res.status(204).end();
};
