import { Request, Response } from 'express';
import { TwitterService } from '../../../services/TwitterService';
import { AccountService } from '../../../services/AccountService';

export const getTwitter = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.params.sub);
    const isAuthorized = await TwitterService.isAuthorized(account);
    if (!isAuthorized) return res.json({ isAuthorized: false });

    res.json({ isAuthorized });
};
