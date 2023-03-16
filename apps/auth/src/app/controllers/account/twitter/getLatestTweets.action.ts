import { Request, Response } from 'express';
import { TwitterService } from '../../../services/TwitterService';
import { AccountService } from '../../../services/AccountService';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';

export const getLatestTweets = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.params.sub);
    const isAuthorized = await TwitterService.isAuthorized(account);
    if (!isAuthorized) throw new Error('Not authorized for Twitter');

    const token = account.getToken(AccessTokenKind.Twitter);
    const tweets = await TwitterService.getLatestTweets(
        token,
        new Date(Number(req.query.startDate)),
        new Date(Number(req.query.endDate)),
    );

    res.json(tweets);
};
