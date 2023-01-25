import { Request, Response } from 'express';
import { AccountService } from '../../../services/AccountService';
import GithubService from '@thxnetwork/auth/services/GithubServices';

export const getGithub = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.params.sub);
    const isAuthorized = await GithubService.isAuthorized(account);
    if (!isAuthorized) return res.json({ isAuthorized: false });

    res.json({ isAuthorized });
};
