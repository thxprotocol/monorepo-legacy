import { Request, Response } from 'express';
import { AccountDocument } from '../../../models/Account';
import { TwitterService } from '../../../services/TwitterService';
import { AccountService } from '../../../services/AccountService';
import { IAccessToken } from '@thxnetwork/auth/types/TAccount';
import { AccessTokenKind } from '@thxnetwork/auth/types/enums/AccessTokenKind';

async function updateTokens(account: AccountDocument, tokens): Promise<AccountDocument> {
    const token: IAccessToken | undefined = account.getToken(AccessTokenKind.Twitter);
    const expiry = tokens.expires_in ? Date.now() + Number(tokens.expires_in) * 1000 : undefined;
    if (!token) {
        account.createToken({
            kind: AccessTokenKind.Twitter,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiry,
        } as IAccessToken);
    } else {
        account.updateToken(AccessTokenKind.Twitter, {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiry,
        });
    }

    return await account.save();
}

export const getTwitter = async (req: Request, res: Response) => {
    let account: AccountDocument = await AccountService.get(req.params.sub);
    const token: IAccessToken | undefined = account.getToken(AccessTokenKind.Twitter);

    if (!token || !token.accessToken || !token.refreshToken || !token.expiry) {
        return res.json({ isAuthorized: false });
    }

    if (Date.now() > token.expiry) {
        const tokens = await TwitterService.refreshTokens(token.refreshToken);
        account = await updateTokens(account, tokens);
    }

    const tweets = await TwitterService.getTweets(token.accessToken);
    const user = await TwitterService.getUser(token.accessToken);

    res.json({
        isAuthorized: true,
        tweets,
        users: [user],
    });
};
