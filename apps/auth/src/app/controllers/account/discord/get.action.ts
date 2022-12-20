import { Request, Response } from 'express';
import { AccountDocument } from '@thxnetwork/auth/models/Account';
import { AccountService } from '@thxnetwork/auth/services/AccountService';
import { DiscordService } from '@thxnetwork/auth/services/DiscordService';

export const getDiscord = async (req: Request, res: Response) => {
    const account: AccountDocument = await AccountService.get(req.params.sub);
    const isAuthorized = await DiscordService.isAuthorized(account);
    if (!isAuthorized) return res.json({ isAuthorized: false });

    return res.json({ isAuthorized });
};
