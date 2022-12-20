import { Request, Response } from 'express';
import { AccountService } from '../../../../../services/AccountService';

const controller = async (req: Request, res: Response) => {
    const { uid, session } = req.interaction;
    const account = await AccountService.get(session.accountId);

    await AccountService.update(account, { twitterAccess: false });

    res.redirect(`/oidc/${uid}/account`);
};

export default { controller };
