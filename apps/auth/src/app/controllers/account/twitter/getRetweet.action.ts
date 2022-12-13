import { Request, Response } from 'express';
import { AccountService } from '../../../services/AccountService';
import { TwitterService } from '../../../services/TwitterService';

export const getTwitterRetweet = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.params.sub);
    console.log(account);
    const result = await TwitterService.validateRetweet(account.twitterAccessToken, req.params.item);
    console.log(result);

    res.json({
        result,
    });
};
