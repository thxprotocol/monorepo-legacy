import { Request, Response } from 'express';
import { AccountDocument } from '@thxnetwork/auth/models/Account';
import { AccountService } from '@thxnetwork/auth/services/AccountService';
import { TwitchService } from '@thxnetwork/auth/services/TwitchService';
import { AccessTokenKind } from '@thxnetwork/auth/types/enums/AccessTokenKind';
import { IAccessToken } from '@thxnetwork/auth/types/TAccount';

export const getTwitch = async (req: Request, res: Response) => {
    async function updateTokens(account: AccountDocument, newAccessToken: string) {
        account.setToken({
            kind: AccessTokenKind.Twitch,
            token: newAccessToken,
            expiry: Date.now() + Number(3600) * 1000,
        });

        return await account.save();
    }

    let account: AccountDocument = await AccountService.get(req.params.sub);
    const token: IAccessToken | undefined = account.getToken(AccessTokenKind.Twitch);
    if (!token) {
        return res.json({ isAuthorized: false });
    }

    if (Date.now() >= token.expiry) {
        const tokens = await TwitchService.refreshTokens(token.refreshToken);
        account = await updateTokens(account, tokens);
    }

    return res.json({ isAuthorized: true });
};
