import { Request, Response } from 'express';
import { AccountService } from '../../services/AccountService';
import { NotFoundError } from '../../util/errors';

export const patchAccount = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.params.sub);
    if (!account) throw new NotFoundError();

    await AccountService.update(account, {
        address: req.body.address,
        googleAccess: req.body.googleAccess,
        youtubeViewAccess: req.body.youtubeViewAccess,
        youtubeManageAccess: req.body.youtubeManageAccess,
        twitterAccess: req.body.twitterAccess,
        githubAccess: req.body.githubAccess,
        twitchAccess: req.body.twitchAccess,
        discordAccess: req.body.discordAccess,
        authenticationToken: req.body.authenticationToken,
        authenticationTokenExpires: req.body.authenticationTokenExpires,
        plan: req.body.plan,
        email: req.body.email,
    });
    res.status(204).end();
};
