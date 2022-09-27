import { Request, Response } from 'express';
import { AccountService } from '../../../services/AccountService';
import { TwitterService } from '../../../services/TwitterService';

export const getTwitterRetweet = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.params.sub);
    const result = await TwitterService.validateRetweet(account.twitterAccessToken, req.params.item);

    res.json({
        result,
    });
};
