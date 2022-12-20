import { Request, Response } from 'express';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { body, check } from 'express-validator';
import { isAddress } from 'web3-utils';
import { DuplicateEmailError } from '@thxnetwork/api/util/errors';

const validation = [
    body('email').exists(),
    body('password').exists(),
    body('address')
        .optional()
        .custom((value) => {
            return isAddress(value);
        }),
    check('email', 'Email is not valid').isEmail(),
    check('password', 'Password must be at least 4 characters long').isLength({ min: 16 }),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Account']
    const isDuplicate = await AccountProxy.isEmailDuplicate(req.body.email);

    if (isDuplicate) {
        throw new DuplicateEmailError();
    }

    const account = await AccountProxy.signupFor(req.body.email, req.body.password, req.body.address);

    res.status(201).json({ sub: account.sub, address: account.address });
};

export default { controller, validation };
