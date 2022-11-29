import { Request, Response } from 'express';
import { TwitterService } from '../../../services/TwitterService';
import { YouTubeService } from '../../../services/YouTubeService';
import { AccountService } from '../../../services/AccountService';
import { GithubService } from '../../../services/GithubServices';

async function controller(req: Request, res: Response) {
    const { uid, params, alert, session } = req.interaction;
    const account = await AccountService.get(session.accountId);

    params.githubLoginUrl = GithubService.getLoginURL(uid, {});
    params.googleLoginUrl = YouTubeService.getLoginUrl(req.params.uid, YouTubeService.getBasicScopes());
    params.twitterLoginUrl = TwitterService.getLoginURL(uid, {});

    return res.render('account', {
        uid,
        alert,
        params: {
            ...params,
            email: account.email,
            firstName: account.firstName,
            lastName: account.lastName,
            profileImg: account.profileImg,
            organisation: account.organisation,
            address: account.address,
            walletAddress: account.walletAddress,
            plan: account.plan,
            otpSecret: account.otpSecret,
            googleAccess: account.googleAccessToken && account.googleAccessTokenExpires > Date.now(),
            twitterAccess: account.twitterAccessToken && account.twitterAccessTokenExpires > Date.now(),
        },
    });
}

export default { controller };
