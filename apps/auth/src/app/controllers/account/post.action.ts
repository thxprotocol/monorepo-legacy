import { Request, Response } from 'express';

import { AccountService } from '../../services/AccountService';
import airtable from '../../util/airtable';

export const postAccount = async (req: Request, res: Response) => {
    const userExists = await AccountService.isActiveUserByEmail(req.body.email);

    let account;

    if (!userExists) {
        account = await AccountService.invite(req.body.email, req.body.password, req.body.address);

        await airtable.pipelineSignup({
            Email: account.email,
            Date: account.createdAt,
        });
    } else {
        account = await AccountService.getByEmail(req.body.email);
    }

    res.status(201).json({
        id: account._id,
        address: account.address,
    });
};
