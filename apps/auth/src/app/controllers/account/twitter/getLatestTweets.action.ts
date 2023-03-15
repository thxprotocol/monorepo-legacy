import { Request, Response } from 'express';
import { TwitterService } from '../../../services/TwitterService';
import { AccountService } from '../../../services/AccountService';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';
import { isDate } from 'date-fns';
import { BadRequestError } from '@thxnetwork/auth/util/errors';

export const getLatestTweets = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.params.sub);
    const isAuthorized = await TwitterService.isAuthorized(account);
    if (!isAuthorized) return res.json({ isAuthorized: false });

    const token = account.getToken(AccessTokenKind.Twitter);
    console.log('REQ.query', req.query);

    const startDate = Number(req.query.startDate);
    const endDate = Number(req.query.endDate);

    const tweets = await TwitterService.getLatestTweets(token.accessToken, new Date(startDate), new Date(endDate));

    res.json(tweets);
};
