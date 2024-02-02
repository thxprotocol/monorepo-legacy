import { Request, Response } from 'express';
import { AccountService } from '../../services/AccountService';
import { NotFoundError } from '../../util/errors';
import { hubspot } from '@thxnetwork/auth/util/hubspot';
import { body, param } from 'express-validator';

const validation = [
    param('sub').isMongoId(),
    body('email')
        .optional()
        .isEmail()
        .customSanitizer((email) => email && email.toLowerCase()),
];

const controller = async (req: Request, res: Response) => {
    let account = await AccountService.get(req.params.sub);
    if (!account) throw new NotFoundError('Account not found.');

    account = await AccountService.update(account, req.body);

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

    res.json(account);
};

export default { controller, validation };
