import { Request, Response } from 'express';
import { AccountDocument } from '../../../models/Account';
import { TwitterService } from '../../../services/TwitterService';
import { AccountService } from '../../../services/AccountService';

export const getTwitter = async (req: Request, res: Response) => {
    const account: AccountDocument = await AccountService.get(req.params.sub);

    if (!account.twitterAccessToken || !account.twitterRefreshToken || Date.now() > account.twitterAccessTokenExpires) {
        return res.json({ isAuthorized: false });
    }

    const tweets = await TwitterService.getTweets(account.twitterAccessToken);
    const user = await TwitterService.getUser(account.twitterAccessToken);

    res.json({
        isAuthorized: true,
        tweets,
        users: [user],
    });
};
