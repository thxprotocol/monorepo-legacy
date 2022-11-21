import { Request, Response } from 'express';
import { AccountDocument } from '@thxnetwork/auth/models/Account';
import { AccountService } from '@thxnetwork/auth/services/AccountService';
import { TwitchService } from '@thxnetwork/auth/services/TwitchService';

export const getTwitch = async (req: Request, res: Response) => {
    async function updateTokens(account: AccountDocument, newAccessToken: string) {
        account.twitchAccessToken = newAccessToken || account.twitchAccessToken;
        account.twitchAccessTokenExpires = Date.now() + Number(3600) * 1000;

        return await account.save();
    }

    let account: AccountDocument = await AccountService.get(req.params.sub);

    if (!account.twitchAccessToken || !account.twitchRefreshToken) {
        return res.json({ isAuthorized: false });
    }

    if (Date.now() >= account.twitchAccessTokenExpires) {
        const tokens = await TwitchService.refreshTokens(account.twitchRefreshToken);
        account = await updateTokens(account, tokens);
    }
};
