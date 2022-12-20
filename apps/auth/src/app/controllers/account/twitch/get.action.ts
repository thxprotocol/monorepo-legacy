import { Request, Response } from 'express';
import { AccountDocument } from '@thxnetwork/auth/models/Account';
import { AccountService } from '@thxnetwork/auth/services/AccountService';
import { TwitchService } from '@thxnetwork/auth/services/TwitchService';

export const getTwitch = async (req: Request, res: Response) => {
    const account: AccountDocument = await AccountService.get(req.params.sub);
    const isAuthorized = await TwitchService.isAuthorized(account);
    if (!isAuthorized) return res.json({ isAuthorized: false });
    return res.json({ isAuthorized });
};
