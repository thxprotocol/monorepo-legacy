import { Request, Response } from 'express';
import { AccountDocument } from '@thxnetwork/auth/models/Account';
import { AccountService } from '@thxnetwork/auth/services/AccountService';
import { DiscordService } from '@thxnetwork/auth/services/DiscordService';

export const getDiscord = async (req: Request, res: Response) => {
    async function updateTokens(account: AccountDocument, newAccessToken: string) {
        account.discordAccessToken = newAccessToken || account.discordAccessToken;
        account.discordAccessTokenExpires = Date.now() + Number(3600) * 1000;

        return await account.save();
    }

    let account: AccountDocument = await AccountService.get(req.params.sub);

    if (!account.discordAccessToken || !account.discordRefreshToken) {
        return res.json({ isAuthorized: false });
    }

    if (Date.now() >= account.discordAccessTokenExpires) {
        const tokens = await DiscordService.refreshTokens(account.discordRefreshToken);
        account = await updateTokens(account, tokens);
    }
};
