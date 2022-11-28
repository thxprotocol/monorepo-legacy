import { Request, Response } from 'express';
import { AccountDocument } from '../../../models/Account';
import { TwitterService } from '../../../services/TwitterService';
import { AccountService } from '../../../services/AccountService';

async function updateTokens(account: AccountDocument, tokens): Promise<AccountDocument> {
    account.twitterAccessToken = tokens.access_token || account.twitterAccessToken;
    account.twitterRefreshToken = tokens.refresh_token || account.twitterRefreshToken;
    account.twitterAccessTokenExpires = tokens.expires_in
        ? Date.now() + Number(tokens.expires_in) * 1000
        : account.twitterAccessTokenExpires;

    return await account.save();
}

export const getTwitter = async (req: Request, res: Response) => {
    let account: AccountDocument = await AccountService.get(req.params.sub);

    if (!account.twitterAccessToken || !account.twitterRefreshToken) {
        return res.json({ isAuthorized: false });
    }

    if (Date.now() > account.twitterAccessTokenExpires) {
        const tokens = await TwitterService.refreshTokens(account.twitterRefreshToken);
        account = await updateTokens(account, tokens);
    }

    const tweets = await TwitterService.getTweets(account.twitterAccessToken);
    const user = await TwitterService.getUser(account.twitterAccessToken);

    res.json({
        isAuthorized: true,
        tweets,
        users: [user],
    });
};
