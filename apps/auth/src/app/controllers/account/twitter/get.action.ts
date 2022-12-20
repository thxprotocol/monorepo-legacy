import { Request, Response } from 'express';
import { TwitterService } from '../../../services/TwitterService';
import { AccountService } from '../../../services/AccountService';
import { AccessTokenKind } from '@thxnetwork/auth/types/enums/AccessTokenKind';

export const getTwitter = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.params.sub);
    const isAuthorized = await TwitterService.isAuthorized(account);
    if (!isAuthorized) return res.json({ isAuthorized: false });

    const token = account.getToken(AccessTokenKind.Twitter);
    const tweets = await TwitterService.getTweets(token.accessToken);
    const user = await TwitterService.getUser(token.accessToken);

    res.json({ isAuthorized, tweets, users: [user] });
};
