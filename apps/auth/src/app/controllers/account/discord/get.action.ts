import { Request, Response } from 'express';
import { AccountDocument } from '@thxnetwork/auth/models/Account';
import { AccountService } from '@thxnetwork/auth/services/AccountService';
import { DiscordService } from '@thxnetwork/auth/services/DiscordService';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';

export const getDiscord = async (req: Request, res: Response) => {
    const account: AccountDocument = await AccountService.get(req.params.sub);
    const isAuthorized = await DiscordService.isAuthorized(account);
    if (!isAuthorized) return res.json({ isAuthorized: false });

    const token = account.getToken(AccessTokenKind.Discord);
    const guilds = await DiscordService.getGuilds(token.accessToken);

    return res.json({ isAuthorized, guilds });
};
