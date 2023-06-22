import { Request, Response } from 'express';
import { AccountService } from '../../../../../services/AccountService';
import { TAccount } from '@thxnetwork/types/interfaces';

const controller = async (req: Request, res: Response) => {
    const { uid, session } = req.interaction;
    const account = await AccountService.get(session.accountId);

    await AccountService.update(account, { discordAccess: false } as TAccount);

    res.redirect(`/oidc/${uid}/account`);
};

export default { controller };
