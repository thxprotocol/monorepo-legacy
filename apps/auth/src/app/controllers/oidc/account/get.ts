import { Request, Response } from 'express';
import { DiscordService } from '../../../services/DiscordService';
import { TwitterService } from '../../../services/TwitterService';
import { YouTubeService } from '../../../services/YouTubeService';
import { AccountService } from '../../../services/AccountService';
import { GithubService } from '../../../services/GithubServices';
import { IAccessToken } from '@thxnetwork/auth/types/TAccount';
import { AccessTokenKind } from '@thxnetwork/auth/types/enums/AccessTokenKind';
import { TwitchService } from '@thxnetwork/auth/services/TwitchService';

async function controller(req: Request, res: Response) {
    const { uid, params, alert, session } = req.interaction;
    const account = await AccountService.get(session.accountId);

    params.githubLoginUrl = GithubService.getLoginURL(uid, {});
    params.googleLoginUrl = YouTubeService.getLoginUrl(req.params.uid, YouTubeService.getBasicScopes());
    params.twitterLoginUrl = TwitterService.getLoginURL(uid, {});
    params.discordLoginUrl = DiscordService.getLoginURL(uid, {});
    params.twitchLoginUrl = TwitchService.getLoginURL(uid, {});

    let googleAccess = false;
    let token: IAccessToken | undefined = account.getToken(AccessTokenKind.Google);
    if (token) {
        googleAccess = token.accessToken !== undefined && token.expiry > Date.now();
    }
    let twitterAccess = false;
    token = account.getToken(AccessTokenKind.Twitter);
    if (token) {
        twitterAccess = token.accessToken !== undefined && token.expiry > Date.now();
    }

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
            googleAccess,
            twitterAccess,
        },
    });
}

export default { controller };
